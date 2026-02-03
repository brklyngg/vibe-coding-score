#!/usr/bin/env node

import { parseArgs } from "node:util";
import { platform, homedir } from "node:os";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
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

function printHelp(): void {
  console.log(`
  vibecheck-probe — scan your AI coding setup

  Usage:
    vibecheck-probe [options]

  Options:
    --help         Show this help message
    --json         Output raw ProbeResult as JSON
    --submit       Submit results to vibecheck.dev
    --handle <id>  Your handle (3-39 chars, lowercase, hyphens, underscores)
    --url <url>    Override submit URL (default: https://vibecheck.dev)
    --yes          Skip submit confirmation prompt
`);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      help: { type: "boolean", default: false },
      json: { type: "boolean", default: false },
      submit: { type: "boolean", default: false },
      handle: { type: "string" },
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
    renderResults(score, detections);
  }

  // --submit flow
  if (values.submit) {
    const handle = values.handle;
    if (!handle || !HANDLE_RE.test(handle)) {
      console.error(
        "\x1b[31m  --handle is required for --submit (3-39 chars, lowercase alphanumeric/hyphens/underscores)\x1b[0m"
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
        `\n  Submit results as \x1b[1m${handle}\x1b[0m to vibecheck.dev? [Y/n] `
      );
      rl.close();
      if (answer.trim().toLowerCase() === "n") {
        console.log("  Submission skipped.");
        return;
      }
    }

    const submitUrl = values.url ?? "https://vibecheck.dev";
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
