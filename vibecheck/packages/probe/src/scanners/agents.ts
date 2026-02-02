import { readdir } from "node:fs/promises";
import type { ScanResult } from "../types.js";
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
        findings.push({
          id: "subagents",
          source: ".claude/agents/",
          confidence: "high",
          details: { count: agents.length },
        });
      }
    } catch {
      // directory doesn't exist
    }

    // Check for AGENTS.md, SOUL.md, EVOLVE.md
    const specialFiles = [
      { file: "AGENTS.md", id: "agents-md" },
      { file: "SOUL.md", id: "soul-md" },
    ] as const;

    for (const { file, id } of specialFiles) {
      if (await fileExists(file)) {
        findings.push({
          id,
          source: file,
          confidence: "high",
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
        findings.push({
          id: "claude-skills",
          source: ".claude/skills/",
          confidence: "high",
          details: { count: skills.length },
        });
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
