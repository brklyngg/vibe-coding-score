#!/usr/bin/env node

import { parseArgs } from "node:util";
import { platform } from "node:os";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { Detection, ProbeResult } from "./types.js";
import { computeScore } from "./scoring/engine.js";
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
import { renderResults, createSpinner } from "./output/terminal.js";
import { confirmDetections } from "./output/confirm.js";

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

function printHelp(): void {
  console.log(`
  vibecheck-probe — scan your AI coding setup

  Usage:
    vibecheck-probe [options]

  Options:
    --help         Show this help message
    --json         Output raw ProbeResult as JSON
    --no-confirm   Skip detection confirmation prompt
`);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      help: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      "no-confirm": { type: "boolean", default: false },
    },
    strict: true,
  });

  if (values.help) {
    printHelp();
    process.exit(0);
  }

  const isJson = values.json ?? false;
  const noConfirm = values["no-confirm"] ?? false;

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
  ];

  const spinner = isJson ? null : createSpinner("Scanning your AI setup...");
  spinner?.start();

  const scanResults = await runAllScanners(scanners);

  spinner?.stop();

  // Flatten and deduplicate detections by id
  const seen = new Set<string>();
  const detections: Detection[] = [];
  for (const result of scanResults) {
    for (const d of result.detections) {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        detections.push(d);
      }
    }
  }

  // Confirm with user (unless --json or --no-confirm)
  let confirmed: Detection[];
  if (isJson || noConfirm) {
    confirmed = detections;
  } else {
    confirmed = await confirmDetections(detections);
    if (confirmed.length === 0) {
      process.exit(0);
    }
  }

  const score = computeScore(confirmed);
  const version = getVersion();

  const result: ProbeResult = {
    version,
    timestamp: new Date().toISOString(),
    platform: platform(),
    scanResults,
    detections: confirmed,
    score,
  };

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    renderResults(score, confirmed);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
