import type { ProbeResult } from "@vibe/scoring";
import chalk from "chalk";
import { interactiveMerge } from "./merge.js";
import { interactiveCompare } from "./compare.js";
import { submitResult } from "./submit.js";
import { openBrowser } from "../utils/open.js";

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

  const analysisUrl = submitOutcome.success && submitOutcome.url && submitOutcome.token
    ? `${submitOutcome.url}?token=${submitOutcome.token}`
    : null;

  // Show analysis link prominently if available
  if (analysisUrl) {
    const label = "Your AI-powered analysis is ready:";
    const width = Math.max(label.length, analysisUrl.length) + 4;
    const border = "─".repeat(width);
    console.log();
    console.log(`  ${chalk.green("┌" + border + "┐")}`);
    console.log(`  ${chalk.green("│")}  ${chalk.bold.white(label)}${" ".repeat(width - label.length - 2)}${chalk.green("│")}`);
    console.log(`  ${chalk.green("│")}  ${chalk.cyan(analysisUrl)}${" ".repeat(width - analysisUrl.length - 2)}${chalk.green("│")}`);
    console.log(`  ${chalk.green("└" + border + "┘")}`);
  }

  const rl = await import("node:readline/promises").then((m) =>
    m.createInterface({ input: process.stdin, output: process.stdout })
  );

  try {
    const sep = "─".repeat(42);
    console.log();
    console.log(`  ${chalk.bold.white("WHAT'S NEXT?")}`);
    console.log(`  ${chalk.gray(sep)}`);
    console.log(`  ${chalk.white("[1]")} I also use AI tools on another machine`);
    console.log(`       ${chalk.gray("Scan both, get one combined score")}`);
    console.log(`  ${chalk.white("[2]")} Compare with a friend`);
    if (analysisUrl) {
      console.log(`  ${chalk.green("[Enter]")} View your full analysis in browser`);
    } else {
      console.log(`  ${chalk.white("[Enter]")} Done`);
    }
    console.log(`  ${chalk.gray(sep)}`);

    const answer = await rl.question(`\n  Choice: `);
    const choice = answer.trim();

    if (choice === "1") {
      await interactiveMerge(rl, result, url);
    } else if (choice === "2") {
      await interactiveCompare(rl, result, url);
    } else if (analysisUrl) {
      openBrowser(analysisUrl);
    }
  } finally {
    rl.close();
  }
}
