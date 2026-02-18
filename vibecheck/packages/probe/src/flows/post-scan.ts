import type { ProbeResult } from "@vibe/scoring";
import chalk from "chalk";
import { interactiveMerge } from "./merge.js";
import { interactiveCompare } from "./compare.js";
import { submitResult } from "./submit.js";
import { openBrowser } from "../utils/open.js";

function printAnalysisBox(analysisUrl: string): void {
  const label = "Your AI-powered analysis is ready:";
  const width = Math.max(label.length, analysisUrl.length) + 4;
  const border = "─".repeat(width);
  console.log();
  console.log(`  ${chalk.green("┌" + border + "┐")}`);
  console.log(`  ${chalk.green("│")}  ${chalk.bold.white(label)}${" ".repeat(width - label.length - 2)}${chalk.green("│")}`);
  console.log(`  ${chalk.green("│")}  ${chalk.cyan(analysisUrl)}${" ".repeat(width - analysisUrl.length - 2)}${chalk.green("│")}`);
  console.log(`  ${chalk.green("└" + border + "┘")}`);
}

export async function postScanFlow(
  result: ProbeResult,
  url: string,
): Promise<void> {
  // Guard: skip in non-interactive contexts
  if (!process.stdin.isTTY) return;

  // Auto-submit silently to get analysis URL
  const submitOutcome = await submitResult({
    result,
    url,
    skipConfirm: true,
    silent: true,
  });

  let analysisUrl = submitOutcome.success && submitOutcome.url && submitOutcome.token
    ? `${submitOutcome.url}?token=${submitOutcome.token}`
    : null;

  if (analysisUrl) {
    printAnalysisBox(analysisUrl);
  }

  const rl = await import("node:readline/promises").then((m) =>
    m.createInterface({ input: process.stdin, output: process.stdout })
  );

  let currentResult = result;
  const available = new Set<string>(["merge", "compare"]);
  let browserOpened = false;

  try {
    while (true) {
      const sep = "─".repeat(42);
      console.log();
      console.log(`  ${chalk.bold.white("WHAT'S NEXT?")}`);
      console.log(`  ${chalk.gray(sep)}`);
      if (available.has("merge")) {
        console.log(`  ${chalk.white("[1]")} I also use AI tools on another machine`);
        console.log(`       ${chalk.gray("Scan both, get one combined score")}`);
      }
      if (available.has("compare")) {
        console.log(`  ${chalk.white("[2]")} Compare with a friend`);
      }
      if (analysisUrl && !browserOpened) {
        console.log(`  ${chalk.green("[Enter]")} View your full analysis in browser`);
      } else {
        console.log(`  ${chalk.white("[Enter]")} Done`);
      }
      console.log(`  ${chalk.gray(sep)}`);

      const answer = await rl.question(`\n  Choice: `);
      const choice = answer.trim();

      if (choice === "1" && available.has("merge")) {
        const merged = await interactiveMerge(rl, currentResult, url);
        available.delete("merge");
        if (merged) {
          currentResult = merged;
          // Re-submit to get updated analysis URL
          const resubmit = await submitResult({
            result: currentResult,
            url,
            skipConfirm: true,
            silent: true,
          });
          if (resubmit.success && resubmit.url && resubmit.token) {
            analysisUrl = `${resubmit.url}?token=${resubmit.token}`;
          }
          browserOpened = false; // new URL, allow re-open
        }
        if (analysisUrl) {
          printAnalysisBox(analysisUrl);
        }
      } else if (choice === "2" && available.has("compare")) {
        await interactiveCompare(rl, currentResult, url);
        available.delete("compare");
        if (analysisUrl) {
          printAnalysisBox(analysisUrl);
        }
      } else {
        // Enter or unrecognized input
        if (analysisUrl && !browserOpened) {
          openBrowser(analysisUrl);
          browserOpened = true;
          if (available.size === 0) break;
          // Loop back to show remaining options
        } else {
          break;
        }
      }

      // If no numbered options remain and browser already opened, exit
      if (available.size === 0 && browserOpened) break;
    }
  } finally {
    rl.close();
  }
}
