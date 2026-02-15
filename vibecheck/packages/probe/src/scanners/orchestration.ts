import { readdir } from "node:fs/promises";
import type { ScanResult } from "@vibe/scoring";
import type { Scanner } from "./index.js";
import { classify, type RawFinding } from "../taxonomy/classifier.js";
import { fileExists, shellOutput, expandHome } from "./utils.js";

export class OrchestrationScanner implements Scanner {
  name = "orchestration";

  async scan(): Promise<ScanResult> {
    const start = performance.now();
    const findings: RawFinding[] = [];

    // tmux
    const tmux = await shellOutput("which tmux");
    if (tmux) {
      const hasTmuxConf = await fileExists("~/.tmux.conf");
      findings.push({
        id: "tmux",
        source: hasTmuxConf ? "~/.tmux.conf" : "which tmux",
        confidence: hasTmuxConf ? "high" : "medium",
      });
    }

    // git worktrees
    const worktrees = await shellOutput("git worktree list");
    if (worktrees) {
      const count = worktrees.split("\n").length;
      if (count > 1) {
        findings.push({
          id: "git-worktrees",
          source: "git worktree list",
          confidence: "high",
          details: { worktreeCount: count },
        });
      }
    }

    // Orchestrator CLIs
    const orchestrators = [
      { cmd: "which gt", id: "orchestrator-gastown" },
      { cmd: "which claude-flow", id: "orchestrator-claudeflow" },
      { cmd: "which openclaw", id: "orchestrator-openclaw" },
      { cmd: "which devswarm", id: "orchestrator-devswarm" },
    ] as const;

    const orchResults = await Promise.all(
      orchestrators.map(({ cmd }) => shellOutput(cmd))
    );
    for (let i = 0; i < orchestrators.length; i++) {
      if (orchResults[i]) {
        findings.push({
          id: orchestrators[i].id,
          source: orchestrators[i].cmd,
          confidence: "high",
        });
      }
    }

    // HEARTBEAT.md
    const heartbeatPaths = ["HEARTBEAT.md", "~/HEARTBEAT.md"];
    for (const path of heartbeatPaths) {
      if (await fileExists(path)) {
        findings.push({
          id: "heartbeat",
          source: path,
          confidence: "high",
        });
        break;
      }
    }

    // Crontab for agent-related entries (grep pipe, never load full crontab)
    const countRaw = await shellOutput(
      `crontab -l 2>/dev/null | grep -ciE "claude|agent|heartbeat|sweep|cron.*ai|openclaw|clawdbot"`
    );
    const matchCount = parseInt(countRaw ?? "0") || 0;
    if (matchCount > 0) {
      findings.push({
        id: "parallel-scripts",
        source: "crontab",
        confidence: "medium",
        details: { count: matchCount },
      });
      if (matchCount >= 5) {
        findings.push({
          id: "cron-scheduler:heavy",
          source: "crontab",
          confidence: "high",
          details: { count: matchCount },
        });
      }
    }

    // macOS LaunchAgents
    try {
      const launchAgentsDir = expandHome(
        "~/Library/LaunchAgents"
      );
      const plists = await readdir(launchAgentsDir);
      const agentPlists = plists.filter(
        (p) =>
          /claude|claude-?flow|openclaw|devswarm|heartbeat|ai-?agent/i.test(p) &&
          p.endsWith(".plist")
      );
      if (agentPlists.length > 0) {
        findings.push({
          id: "parallel-scripts",
          source: "~/Library/LaunchAgents/",
          confidence: "medium",
          details: { plists: agentPlists },
        });
      }
    } catch {
      // directory doesn't exist or not macOS
    }

    return {
      scanner: this.name,
      detections: classify(findings),
      duration: Math.round(performance.now() - start),
    };
  }
}
