import { readdir } from "node:fs/promises";
import type { ScanResult } from "../types.js";
import type { Scanner } from "./index.js";
import { classify, type RawFinding } from "../taxonomy/classifier.js";
import { fileExists, readFileIfExists, expandHome } from "./utils.js";

function tierByLineCount(lineCount: number): "basic" | "intermediate" | "advanced" | "elite" {
  if (lineCount >= 100) return "elite";
  if (lineCount >= 50) return "advanced";
  if (lineCount >= 20) return "intermediate";
  return "basic";
}

export class MemoryScanner implements Scanner {
  name = "memory";

  async scan(): Promise<ScanResult> {
    const start = performance.now();
    const findings: RawFinding[] = [];

    // CLAUDE.md in CWD
    const cwdClaudeMd = await readFileIfExists("CLAUDE.md");
    if (cwdClaudeMd) {
      const lines = cwdClaudeMd.split("\n").length;
      const sections = (cwdClaudeMd.match(/^##?\s+/gm) ?? []).length;
      findings.push({
        id: "claude-md",
        source: "CLAUDE.md",
        confidence: "high",
        details: { lineCount: lines, sections, complexity: tierByLineCount(lines) },
      });
    }

    // Global CLAUDE.md
    const globalClaudeMd = await readFileIfExists(
      "~/.claude/CLAUDE.md"
    );
    if (globalClaudeMd && !cwdClaudeMd) {
      const lines = globalClaudeMd.split("\n").length;
      findings.push({
        id: "claude-md",
        source: "~/.claude/CLAUDE.md",
        confidence: "high",
        details: { lineCount: lines, complexity: tierByLineCount(lines) },
      });
    }

    // Claude memories directory
    try {
      const memoriesDir = expandHome("~/.claude/memories");
      const memories = await readdir(memoriesDir);
      if (memories.length > 0) {
        findings.push({
          id: "claude-memories",
          source: "~/.claude/memories/",
          confidence: "high",
          details: { fileCount: memories.length },
        });
      }
    } catch {
      // directory doesn't exist
    }

    // Split rules
    try {
      const rules = await readdir(".claude/rules");
      if (rules.length > 0) {
        findings.push({
          id: "split-rules",
          source: ".claude/rules/",
          confidence: "high",
          details: { ruleCount: rules.length },
        });
      }
    } catch {
      // no rules dir
    }

    // MEMORY.md
    if (await fileExists("MEMORY.md")) {
      findings.push({
        id: "memory-md",
        source: "MEMORY.md",
        confidence: "high",
      });
    }

    // Daily logs (YYYY-MM-DD.md pattern)
    const logDirs = ["logs", "daily", ".logs", ".daily"];
    for (const dir of logDirs) {
      try {
        const files = await readdir(dir);
        const dailyLogs = files.filter((f) =>
          /^\d{4}-\d{2}-\d{2}\.md$/.test(f)
        );
        if (dailyLogs.length > 0) {
          findings.push({
            id: "daily-logs",
            source: `${dir}/`,
            confidence: "high",
            details: { logCount: dailyLogs.length },
          });
          break;
        }
      } catch {
        // dir doesn't exist
      }
    }

    // .cursorrules
    if (await fileExists(".cursorrules")) {
      findings.push({
        id: "cursorrules",
        source: ".cursorrules",
        confidence: "high",
      });
    }

    // .windsurfrules
    if (await fileExists(".windsurfrules")) {
      findings.push({
        id: "windsurfrules",
        source: ".windsurfrules",
        confidence: "high",
      });
    }

    // Copilot instructions
    if (await fileExists(".github/copilot-instructions.md")) {
      findings.push({
        id: "copilot-instructions",
        source: ".github/copilot-instructions.md",
        confidence: "high",
      });
    }

    return {
      scanner: this.name,
      detections: classify(findings),
      duration: Math.round(performance.now() - start),
    };
  }
}
