import type { ScanResult } from "@vibe/scoring";
import type { Scanner } from "./index.js";
import { classify, type RawFinding } from "../taxonomy/classifier.js";
import { readJsonIfExists, shellOutput, fileExists } from "./utils.js";

interface ClaudeSettings {
  mcpServers?: Record<string, unknown>;
  projects?: Record<string, { mcpServers?: Record<string, unknown> }>;
  [key: string]: unknown;
}

const KNOWN_MCP: Record<string, string> = {
  filesystem: "mcp-filesystem",
  github: "mcp-github",
  obsidian: "mcp-obsidian",
  supabase: "mcp-supabase",
  "google-drive": "mcp-google-drive",
  "brave-search": "mcp-brave-search",
  slack: "mcp-slack",
  puppeteer: "mcp-puppeteer",
  playwright: "mcp-playwright",
  postgres: "mcp-postgres",
  sqlite: "mcp-sqlite",
  sentry: "mcp-sentry",
  notion: "mcp-notion",
  linear: "mcp-linear",
  vercel: "mcp-vercel",
};

export class McpScanner implements Scanner {
  name = "mcp";

  async scan(): Promise<ScanResult> {
    const start = performance.now();
    const findings: RawFinding[] = [];
    const seen = new Set<string>();

    // Read Claude settings files (Code + Desktop)
    const settingsPaths = [
      "~/.claude/settings.json",
      "~/.claude/settings.local.json",
      "~/Library/Application Support/Claude/claude_desktop_config.json",
      "~/.config/Claude/claude_desktop_config.json",
    ];

    for (const path of settingsPaths) {
      const settings = await readJsonIfExists<ClaudeSettings>(path);
      if (!settings?.mcpServers) continue;

      for (const key of Object.keys(settings.mcpServers)) {
        const normalized = key.toLowerCase();
        const knownId = KNOWN_MCP[normalized];

        if (knownId && !seen.has(knownId)) {
          seen.add(knownId);
          findings.push({
            id: knownId,
            source: path,
            confidence: "high",
          });
        } else if (!knownId) {
          const customId = `mcp-${normalized}`;
          if (!seen.has(customId)) {
            seen.add(customId);
            findings.push({
              id: customId,
              source: path,
              confidence: "high",
              details: { type: "custom" },
            });
          }
        }
      }

      // Project-scoped MCP servers
      if (settings.projects) {
        for (const proj of Object.values(settings.projects)) {
          if (!proj.mcpServers) continue;
          for (const key of Object.keys(proj.mcpServers)) {
            const normalized = key.toLowerCase();
            const knownId = KNOWN_MCP[normalized];
            const id = knownId ?? `mcp-${normalized}`;
            if (!seen.has(id)) {
              seen.add(id);
              findings.push({
                id,
                source: `${path} (project)`,
                confidence: "high",
                details: knownId ? undefined : { type: "custom" },
              });
            }
          }
        }
      }
    }

    // Read .mcp.json in CWD
    const cwdMcp = await readJsonIfExists<Record<string, unknown>>(
      ".mcp.json"
    );
    if (cwdMcp) {
      const servers =
        (cwdMcp.mcpServers as Record<string, unknown> | undefined) ??
        cwdMcp;
      for (const key of Object.keys(servers)) {
        const normalized = key.toLowerCase();
        const knownId = KNOWN_MCP[normalized];
        const id = knownId ?? `mcp-${normalized}`;
        if (!seen.has(id)) {
          seen.add(id);
          findings.push({
            id,
            source: ".mcp.json",
            confidence: "high",
            details: knownId ? undefined : { type: "custom" },
          });
        }
      }
    }

    // Check CLI tools
    const cliChecks = [
      { cmd: "which claude", id: "claude-code" },
      { cmd: "which codex", id: "codex-cli" },
      { cmd: "which cursor", id: "cursor" },
      { cmd: "which aider", id: "aider" },
      { cmd: "which gemini", id: "gemini-cli" },
    ] as const;

    const cliResults = await Promise.all(
      cliChecks.map(({ cmd }) => shellOutput(cmd))
    );

    for (let i = 0; i < cliChecks.length; i++) {
      if (cliResults[i] && !seen.has(cliChecks[i].id)) {
        seen.add(cliChecks[i].id);
        findings.push({
          id: cliChecks[i].id,
          source: cliChecks[i].cmd,
          confidence: "high",
        });
      }
    }

    // Cursor directory fallback
    if (!seen.has("cursor") && await fileExists("~/.cursor/")) {
      seen.add("cursor");
      findings.push({
        id: "cursor",
        source: "~/.cursor/",
        confidence: "medium",
      });
    }

    return {
      scanner: this.name,
      detections: classify(findings),
      duration: Math.round(performance.now() - start),
    };
  }
}
