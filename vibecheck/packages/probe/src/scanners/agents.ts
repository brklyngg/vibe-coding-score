import { readdir } from "node:fs/promises";
import type { ScanResult } from "@vibe/scoring";
import type { Scanner } from "./index.js";
import { classify, type RawFinding } from "../taxonomy/classifier.js";
import { fileExists, readJsonIfExists } from "./utils.js";

interface ClaudeSettings {
  hooks?: Record<string, unknown>;
  [key: string]: unknown;
}

export class AgentsScanner implements Scanner {
  name = "agents";

  async scan(): Promise<ScanResult> {
    const start = performance.now();
    const findings: RawFinding[] = [];

    // Check .claude/agents/ directory for subagents
    try {
      const agents = await readdir(".claude/agents");
      if (agents.length > 0) {
        const names = agents.map((a) =>
          a.endsWith(".md") ? a.slice(0, -3) : a
        );
        findings.push({
          id: "subagents",
          source: ".claude/agents/",
          confidence: "high",
          details: { count: agents.length, names },
        });
        if (agents.length >= 5) {
          findings.push({
            id: "subagents:extensive",
            source: ".claude/agents/",
            confidence: "high",
            details: { count: agents.length, names },
          });
        } else if (agents.length >= 2) {
          findings.push({
            id: "subagents:moderate",
            source: ".claude/agents/",
            confidence: "high",
            details: { count: agents.length, names },
          });
        }
      }
    } catch {
      // directory doesn't exist
    }

    // Check for AGENTS.md, SOUL.md, EVOLVE.md — CWD first, then home dir
    const specialFiles = [
      { file: "AGENTS.md", id: "agents-md" },
      { file: "SOUL.md", id: "soul-md" },
      { file: "EVOLVE.md", id: "evolve-md" },
    ] as const;

    for (const { file, id } of specialFiles) {
      if (await fileExists(file)) {
        findings.push({
          id,
          source: file,
          confidence: "high",
        });
      } else if (await fileExists(`~/${file}`)) {
        findings.push({
          id,
          source: `~/${file}`,
          confidence: "medium",
        });
      }
    }

    // Check hooks in settings
    const settings = await readJsonIfExists<ClaudeSettings>(
      ".claude/settings.json"
    );
    if (settings?.hooks && Object.keys(settings.hooks).length > 0) {
      findings.push({
        id: "hooks",
        source: ".claude/settings.json",
        confidence: "high",
        details: {
          hookCount: Object.keys(settings.hooks).length,
        },
      });
    }

    // Check .claude/skills/ directory
    try {
      const skills = await readdir(".claude/skills");
      if (skills.length > 0) {
        const names = skills.map((s) =>
          s.endsWith(".md") ? s.slice(0, -3) : s
        );
        findings.push({
          id: "claude-skills",
          source: ".claude/skills/",
          confidence: "high",
          details: { count: skills.length, names },
        });
        if (skills.length >= 8) {
          findings.push({
            id: "claude-skills:extensive",
            source: ".claude/skills/",
            confidence: "high",
            details: { count: skills.length, names },
          });
        } else if (skills.length >= 3) {
          findings.push({
            id: "claude-skills:moderate",
            source: ".claude/skills/",
            confidence: "high",
            details: { count: skills.length, names },
          });
        }
      }
    } catch {
      // directory doesn't exist
    }

    // Check .claude/commands/ directory
    try {
      const commands = await readdir(".claude/commands");
      if (commands.length > 0) {
        const names = commands.map((c) =>
          c.endsWith(".md") ? c.slice(0, -3) : c
        );
        findings.push({
          id: "claude-commands",
          source: ".claude/commands/",
          confidence: "high",
          details: { count: commands.length, names },
        });
        if (commands.length >= 8) {
          findings.push({
            id: "claude-commands:extensive",
            source: ".claude/commands/",
            confidence: "high",
            details: { count: commands.length, names },
          });
        } else if (commands.length >= 3) {
          findings.push({
            id: "claude-commands:moderate",
            source: ".claude/commands/",
            confidence: "high",
            details: { count: commands.length, names },
          });
        }
      }
    } catch {
      // directory doesn't exist
    }

    return {
      scanner: this.name,
      detections: classify(findings),
      duration: Math.round(performance.now() - start),
    };
  }
}
