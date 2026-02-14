import { readdir } from "node:fs/promises";
import type { ScanResult } from "../types.js";
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

    // Crontab for agent-related entries
    const crontab = await shellOutput("crontab -l");
    if (crontab) {
      const agentPatterns =
        /claude|agent|heartbeat|sweep|cron.*ai|openclaw|clawdbot/gi;
      const matches = crontab.match(agentPatterns);
      if (matches && matches.length > 0) {
        findings.push({
          id: "parallel-scripts",
          source: "crontab",
          confidence: "medium",
          details: { type: "crontab", count: matches.length },
        });
        if (matches.length >= 5) {
          findings.push({
            id: "cron-scheduler:heavy",
            source: "crontab",
            confidence: "high",
            details: { count: matches.length },
          });
        }
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
