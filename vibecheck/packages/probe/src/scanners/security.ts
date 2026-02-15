import { stat } from "node:fs/promises";
import type { ScanResult } from "@vibe/scoring";
import type { Scanner } from "./index.js";
import { classify, type RawFinding } from "../taxonomy/classifier.js";
import {
  fileExists,
  readFileIfExists,
  readJsonIfExists,
  shellOutput,
  expandHome,
} from "./utils.js";

interface ClaudeSettings {
  allowedTools?: string[];
  blockedCommands?: string[];
  permissions?: Record<string, unknown>;
  [key: string]: unknown;
}

export class SecurityScanner implements Scanner {
  name = "security";

  async scan(): Promise<ScanResult> {
    const start = performance.now();
    const findings: RawFinding[] = [];

    // .gitignore covers .env
    const gitignore = await readFileIfExists(".gitignore");
    if (gitignore) {
      const envPatterns = /^\.env/m;
      if (envPatterns.test(gitignore)) {
        findings.push({
          id: "gitignore-env",
          source: ".gitignore",
          confidence: "high",
        });
      }
    }

    // Environment variable secrets (grep for presence, never load values)
    const hit = await shellOutput(
      `grep -lE "export\\s+\\w*(KEY|SECRET|TOKEN|PASSWORD)\\w*\\s*=" ~/.zshrc ~/.bashrc ~/.zprofile ~/.bash_profile 2>/dev/null`
    );
    if (hit) {
      findings.push({
        id: "env-vars",
        source: "shell config",
        confidence: "high",
      });
    }

    // Agent permission scoping
    const settings = await readJsonIfExists<ClaudeSettings>(
      ".claude/settings.json"
    );
    if (settings) {
      const hasPermissions =
        settings.allowedTools ||
        settings.blockedCommands ||
        settings.permissions;
      if (hasPermissions) {
        findings.push({
          id: "agent-permissions",
          source: ".claude/settings.json",
          confidence: "medium",
        });
      }
    }

    // File permissions on sensitive files
    const sensitiveFiles = [
      "~/.ssh/id_rsa",
      "~/.ssh/id_ed25519",
      "~/.env",
      ".env",
    ];
    for (const file of sensitiveFiles) {
      try {
        const s = await stat(expandHome(file));
        const perms = s.mode & 0o777;
        // Owner-only read/write is secure (0o600 or 0o400)
        if (perms <= 0o600) {
          findings.push({
            id: "file-permissions",
            source: file,
            confidence: "high",
            details: { permissions: `0o${perms.toString(8)}` },
          });
          break;
        }
      } catch {
        // file doesn't exist
      }
    }

    // Canary tokens
    const configFiles = ["CLAUDE.md", "AGENTS.md", ".claude/settings.json"];
    for (const file of configFiles) {
      const content = await readFileIfExists(file);
      if (content && /canary|honeypot|tripwire/i.test(content)) {
        findings.push({
          id: "canary-tokens",
          source: file,
          confidence: "medium",
        });
        break;
      }
    }

    // Prompt injection defense
    const defenseFiles = ["CLAUDE.md", "AGENTS.md"];
    for (const file of defenseFiles) {
      const content = await readFileIfExists(file);
      if (
        content &&
        /prompt.?injection|safety.?boundar|injection.?defense|do not execute/i.test(
          content
        )
      ) {
        findings.push({
          id: "prompt-injection-defense",
          source: file,
          confidence: "medium",
        });
        break;
      }
    }

    return {
      scanner: this.name,
      detections: classify(findings),
      duration: Math.round(performance.now() - start),
    };
  }
}
