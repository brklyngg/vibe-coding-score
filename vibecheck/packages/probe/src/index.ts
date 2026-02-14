#!/usr/bin/env node

import { parseArgs } from "node:util";
import { platform, homedir } from "node:os";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomUUID, randomBytes } from "node:crypto";
import type { Detection, ProbeResult } from "@vibe/scoring";
import { computeScore } from "@vibe/scoring";
import { runAllScanners } from "./scanners/index.js";
import { EnvironmentScanner } from "./scanners/environment.js";
import { McpScanner } from "./scanners/mcp.js";
import { AgentsScanner } from "./scanners/agents.js";
import { OrchestrationScanner } from "./scanners/orchestration.js";
import { RepositoriesScanner } from "./scanners/repositories.js";
import { MemoryScanner } from "./scanners/memory.js";
import { SecurityScanner } from "./scanners/security.js";
import { DeployScanner } from "./scanners/deploy.js";
import { SocialScanner } from "./scanners/social.js";
import { GitHistoryScanner } from "./scanners/git-history.js";
import { UniversalFileScanner, getSupersededMap } from "./scanners/universal-file.js";
import chalk from "chalk";
import { renderResults, createSpinner } from "./output/terminal.js";

function getVersion(): string {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const pkgPath = join(__dirname, "..", "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    return pkg.version ?? "0.1.0";
  } catch {
    return "0.1.0";
  }
}

const HANDLE_RE = /^[a-z0-9_-]{3,39}$/;
const DEFAULT_URL = "https://vibecheck.crunchy.tools";

function printHelp(): void {
  console.log(`
  vibecheck — scan your AI coding setup

  Usage:
    vibecheck [options]

  Options:
    --help              Show this help message
    --json              Output raw ProbeResult as JSON
    --merge <file>      Merge detections from another scan (JSON file)
    --shallow           Skip global checks (crontab, launchd) for faster scan
    --submit            Submit results to ${DEFAULT_URL}
    --handle <id>       Your handle (auto-generated if omitted)
    --compare create    Create a new comparison
    --compare <code>    Join an existing comparison
    --url <url>         Override submit URL (default: ${DEFAULT_URL})
    --yes               Skip submit confirmation prompt
`);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      help: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      deep: { type: "boolean", default: true },
      shallow: { type: "boolean", default: false },
      merge: { type: "string" },
      submit: { type: "boolean", default: false },
      handle: { type: "string" },
      compare: { type: "string" },
      url: { type: "string" },
      yes: { type: "boolean", default: false },
    },
    strict: true,
  });

  if (values.help) {
    printHelp();
    process.exit(0);
  }

  const isJson = values.json ?? false;

  const isDeep = values.shallow ? false : (values.deep ?? true);

  const scanners = [
    new EnvironmentScanner(),
    new McpScanner(),
    new AgentsScanner(),
    new OrchestrationScanner(),
    new RepositoriesScanner(),
    new MemoryScanner(),
    new SecurityScanner(),
    new DeployScanner(),
    new SocialScanner(),
    new GitHistoryScanner(),
    new UniversalFileScanner(isDeep), // must be last — supersedes v2 for shared artifacts
  ];

  const spinner = isJson ? null : createSpinner("Scanning your AI setup...");
  spinner?.start();

  const scanStart = performance.now();
  const scanResults = await runAllScanners(scanners);
  const scanDurationMs = performance.now() - scanStart;

  spinner?.stop();

  // Flatten and deduplicate detections by id
  // UFS runs last — collect its detections to know which v2 IDs to suppress
  const supersededMap = getSupersededMap(); // v2Id → [ufs IDs that replace it]
  const ufsResult = scanResults.find((r) => r.scanner === "universal-file");
  const ufsDetectionIds = new Set(ufsResult?.detections.map((d) => d.id) ?? []);

  // Only suppress a v2 ID when at least one of its replacement UFS IDs was actually emitted
  const suppressedV2Ids = new Set<string>();
  for (const [v2Id, ufsIds] of supersededMap) {
    if (ufsIds.some((id) => ufsDetectionIds.has(id))) {
      suppressedV2Ids.add(v2Id);
    }
  }

  const seen = new Set<string>();
  const detections: Detection[] = [];
  for (const result of scanResults) {
    for (const d of result.detections) {
      if (seen.has(d.id)) continue;
      // Skip v2 detections when UFS supersedes them
      if (result.scanner !== "universal-file" && suppressedV2Ids.has(d.id)) continue;
      seen.add(d.id);
      detections.push(d);
    }
  }

  // --merge: fold in detections from an external scan
  let mergeCount = 0;
  if (values.merge) {
    try {
      const external = JSON.parse(readFileSync(values.merge, "utf-8")) as ProbeResult;
      for (const d of external.detections) {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          detections.push(d);
          mergeCount++;
        }
      }
    } catch (err) {
      console.error(`\x1b[31m  Failed to read --merge file: ${values.merge}\x1b[0m`);
      process.exit(1);
    }
  }

  const score = computeScore(detections);
  const version = getVersion();

  const result: ProbeResult = {
    version,
    timestamp: new Date().toISOString(),
    platform: platform(),
    scanResults,
    detections,
    score,
  };

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    // Print merge count before results
    if (values.merge && mergeCount > 0) {
      console.log(`  ${chalk.green("✓")} Merged ${mergeCount} signals from ${values.merge}`);
    }

    renderResults(score, detections, scanDurationMs);

    // Interactive agent prompt when autonomy is low and no merge was used
    const autonomyScore = score.categories.find((c) => c.category === "autonomy");
    const hasRemoteKeywords = detections.some((d) =>
      d.id.includes("orchestrator") || d.source.includes("remote") || d.source.includes("tailscale")
    );
    if (!values.merge && !isJson && ((autonomyScore?.score ?? 0) < 30 || hasRemoteKeywords)) {
      const rl = await import("node:readline/promises").then((m) =>
        m.createInterface({ input: process.stdin, output: process.stdout })
      );
      const answer = await rl.question(
        `\n  Do you also run AI tools on a separate machine? [y/N] `
      );
      rl.close();
      if (answer.trim().toLowerCase() === "y") {
        console.log();
        console.log(`  ${chalk.gray("On that machine, run:")}`);
        console.log(`    ${chalk.cyan("npx vibecheck-score --json > agent-scan.json")}`);
        console.log();
        console.log(`  ${chalk.gray("Then come back here and run:")}`);
        console.log(`    ${chalk.cyan("npx vibecheck-score --merge agent-scan.json")}`);
        console.log();
      }
    }
  }

  // --compare requires --submit
  if (values.compare && !values.submit) {
    console.error(
      "\x1b[31m  --compare requires --submit\x1b[0m"
    );
    process.exit(1);
  }

  // --submit flow
  if (values.submit) {
    // Auto-generate handle if omitted
    const handle = values.handle ?? randomBytes(4).toString("hex");
    // Only validate if explicitly provided
    if (values.handle && !HANDLE_RE.test(values.handle)) {
      console.error(
        "\x1b[31m  --handle must be 3-39 chars, lowercase alphanumeric/hyphens/underscores\x1b[0m"
      );
      process.exit(1);
    }

    // Token management: ~/.vibecheck/token
    const tokenDir = join(homedir(), ".vibecheck");
    const tokenPath = join(tokenDir, "token");
    let submissionToken: string;
    if (existsSync(tokenPath)) {
      submissionToken = readFileSync(tokenPath, "utf-8").trim();
    } else {
      submissionToken = randomUUID();
      mkdirSync(tokenDir, { recursive: true });
      writeFileSync(tokenPath, submissionToken, { mode: 0o600 });
    }

    // Confirmation unless --yes
    if (!values.yes && !isJson) {
      const rl = await import("node:readline/promises").then((m) =>
        m.createInterface({ input: process.stdin, output: process.stdout })
      );
      const answer = await rl.question(
        `\n  Submit results as \x1b[1m${handle}\x1b[0m to ${DEFAULT_URL.replace("https://", "")}? [Y/n] `
      );
      rl.close();
      if (answer.trim().toLowerCase() === "n") {
        console.log("  Submission skipped.");
        return;
      }
    }

    const submitUrl = values.url ?? DEFAULT_URL;
    try {
      const res = await fetch(`${submitUrl}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, probeResult: result, submissionToken }),
      });

      if (res.ok) {
        const body = (await res.json()) as { url: string };
        const url = body.url;
        const inner = `  \x1b[32m✓\x1b[0m Published! Share your score:`;
        const urlLine = `  ${url}`;
        const width = Math.max(inner.length - 9, urlLine.length) + 4; // -9 for ANSI codes
        const border = "─".repeat(width);
        console.log(`\n  \x1b[32m┌${border}┐\x1b[0m`);
        console.log(`  \x1b[32m│\x1b[0m ${inner.padEnd(width - 2)} \x1b[32m│\x1b[0m`);
        console.log(`  \x1b[32m│\x1b[0m ${urlLine.padEnd(width - 2)} \x1b[32m│\x1b[0m`);
        console.log(`  \x1b[32m└${border}┘\x1b[0m\n`);

        // --compare flow
        if (values.compare) {
          const compareAction = values.compare === "create" ? "create" : "join";
          const comparePayload: Record<string, string> = { action: compareAction, handle };
          if (compareAction === "join") {
            const code = values.compare;
            if (!/^[a-z0-9]{6}$/.test(code)) {
              console.error(chalk.red("  --compare code must be 6 lowercase hex characters"));
              process.exit(1);
            }
            comparePayload.code = code;
          }

          try {
            const cmpRes = await fetch(`${submitUrl}/api/compare`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(comparePayload),
            });

            if (cmpRes.ok) {
              const cmpBody = (await cmpRes.json()) as { code?: string; url?: string };
              const sep = "─".repeat(42);

              if (compareAction === "create" && cmpBody.code) {
                console.log(`  ${chalk.bold.white("COMPARE MODE")}`);
                console.log(`  ${chalk.gray(sep)}`);
                console.log(`  Share this code:  ${chalk.bold.white(cmpBody.code)}`);
                console.log();
                console.log(`  They run:`);
                console.log(`    ${chalk.cyan(`npx vibecheck-score --submit --compare ${cmpBody.code}`)}`);
                console.log();
                const compareUrl = cmpBody.url ?? `${submitUrl}/compare/${cmpBody.code}`;
                console.log(`  Then both visit:`);
                console.log(`    ${chalk.cyan(compareUrl)}`);
                console.log(`  ${chalk.gray(sep)}`);
                console.log();
              } else if (compareAction === "join" && cmpBody.url) {
                console.log(`  ${chalk.green("✓")} Joined comparison ${chalk.bold(values.compare)}`);
                console.log();
                console.log(`  View the comparison:`);
                console.log(`    ${chalk.cyan(cmpBody.url)}`);
                console.log();
              }
            } else {
              const cmpErr = (await cmpRes.json().catch(() => ({}))) as { error?: string };
              console.error(chalk.red(`  Compare failed: ${cmpErr.error ?? cmpRes.statusText}`));
            }
          } catch {
            console.error(chalk.yellow(`  Could not reach ${submitUrl} for comparison.`));
          }
        }
      } else if (res.status === 403) {
        console.error(
          "\n  \x1b[31m✗ This handle is owned by a different machine.\x1b[0m"
        );
        console.error(
          "  If this is your handle, restore ~/.vibecheck/token from the original machine.\n"
        );
      } else {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        console.error(`\n  \x1b[31m✗ Submit failed: ${body.error ?? res.statusText}\x1b[0m\n`);
      }
    } catch (err) {
      console.error(
        `\n  \x1b[33m⚠ Could not reach ${submitUrl} — results saved locally only.\x1b[0m\n`
      );
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
