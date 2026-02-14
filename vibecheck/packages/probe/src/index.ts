#!/usr/bin/env node

import { parseArgs } from "node:util";
import { platform } from "node:os";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
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
import { submitResult, compareApi, fetchRemoteDetections, postScanFlow } from "./flows/index.js";

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
    --merge-from <id>   Fetch & merge detections from a submitted handle
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
      "merge-from": { type: "string" },
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

  // --merge and --merge-from are mutually exclusive
  if (values.merge && values["merge-from"]) {
    console.error("\x1b[31m  Cannot use both --merge and --merge-from\x1b[0m");
    process.exit(1);
  }

  const isJson = values.json ?? false;
  const url = values.url ?? DEFAULT_URL;

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

  // --merge: fold in detections from a local JSON file
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
    } catch {
      console.error(`\x1b[31m  Failed to read --merge file: ${values.merge}\x1b[0m`);
      process.exit(1);
    }
  }

  // --merge-from: fetch detections from a submitted handle
  if (values["merge-from"]) {
    try {
      const remoteDetections = await fetchRemoteDetections(values["merge-from"], url);
      for (const d of remoteDetections) {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          detections.push(d);
          mergeCount++;
        }
      }
      if (!isJson) {
        console.log(`  ${chalk.green("✓")} Merged ${mergeCount} signals from ${chalk.bold(values["merge-from"])}`);
      }
    } catch (err) {
      console.error(`\x1b[31m  Failed to fetch detections for handle: ${values["merge-from"]}\x1b[0m`);
      if (err instanceof Error) console.error(`  ${err.message}`);
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
    // Print merge count before results (for --merge file only; --merge-from prints its own above)
    if (values.merge && mergeCount > 0) {
      console.log(`  ${chalk.green("✓")} Merged ${mergeCount} signals from ${values.merge}`);
    }

    renderResults(score, detections, scanDurationMs);

    // Auto-submit merged results so Machine A can poll for them
    if (values["merge-from"]) {
      const base = values["merge-from"].slice(0, 31);
      const mergedHandle = `${base}-merged`;
      const autoSubmit = await submitResult({
        result,
        handle: mergedHandle,
        url,
        skipConfirm: true,
        silent: true,
      });

      if (autoSubmit.success) {
        console.log(`  ${chalk.green("✓")} Combined results uploaded as ${chalk.bold(mergedHandle)}`);
        console.log(`    ${chalk.gray("Your main machine will pick these up automatically.")}`);
        console.log();
      } else {
        console.log(`  ${chalk.yellow("⚠")} Could not upload combined results: ${autoSubmit.error}`);
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

  // --submit flow (flag-driven path)
  if (values.submit) {
    const submitOutcome = await submitResult({
      result,
      handle: values.handle,
      url,
      skipConfirm: values.yes || isJson,
    });

    if (!submitOutcome.success) {
      if (submitOutcome.error === "skipped") {
        console.log("  Submission skipped.");
      }
      return;
    }

    // --compare sub-flow
    if (values.compare) {
      const compareAction = values.compare === "create" ? "create" : "join";

      if (compareAction === "join") {
        const code = values.compare;
        if (!/^[a-z0-9]{6}$/.test(code)) {
          console.error(chalk.red("  --compare code must be 6 lowercase hex characters"));
          process.exit(1);
        }

        const cmpResult = await compareApi({
          action: "join",
          handle: submitOutcome.handle,
          code,
          url,
        });

        if (cmpResult.error) {
          console.error(chalk.red(`  Compare failed: ${cmpResult.error}`));
        } else if (cmpResult.url) {
          console.log(`  ${chalk.green("✓")} Joined comparison ${chalk.bold(values.compare)}`);
          console.log();
          console.log(`  View the comparison:`);
          console.log(`    ${chalk.cyan(cmpResult.url)}`);
          console.log();
        }
      } else {
        const cmpResult = await compareApi({
          action: "create",
          handle: submitOutcome.handle,
          url,
        });

        if (cmpResult.error) {
          console.error(chalk.red(`  Compare failed: ${cmpResult.error}`));
        } else if (cmpResult.code) {
          const sep = "─".repeat(42);
          console.log(`  ${chalk.bold.white("COMPARE MODE")}`);
          console.log(`  ${chalk.gray(sep)}`);
          console.log(`  Share this code:  ${chalk.bold.white(cmpResult.code)}`);
          console.log();
          console.log(`  They run:`);
          console.log(`    ${chalk.cyan(`npx vibecheck-score --submit --compare ${cmpResult.code}`)}`);
          console.log();
          const compareUrl = cmpResult.url ?? `${url}/compare/${cmpResult.code}`;
          console.log(`  Then both visit:`);
          console.log(`    ${chalk.cyan(compareUrl)}`);
          console.log(`  ${chalk.gray(sep)}`);
          console.log();
        }
      }
    }

    return;
  }

  // Interactive post-scan flow (only when no flags were used)
  if (!isJson && !values.yes && !values.compare && !values["merge-from"]) {
    await postScanFlow(result, url);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
