import type { ProbeResult } from "@vibe/scoring";
import chalk from "chalk";
import { interactiveMerge } from "./merge.js";
import { interactiveCompare } from "./compare.js";

export async function postScanFlow(
  result: ProbeResult,
  url: string,
): Promise<void> {
  // Guard: skip in non-interactive contexts
  if (!process.stdin.isTTY) return;

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
    console.log(`  ${chalk.white("[3]")} Done ${chalk.gray("(or press Enter)")}`);
    console.log(`  ${chalk.gray(sep)}`);

    const answer = await rl.question(`\n  Choice: `);
    const choice = answer.trim();

    if (choice === "1") {
      await interactiveMerge(rl, result, url);
    } else if (choice === "2") {
      await interactiveCompare(rl, result, url);
    } else {
      // "3", empty, or anything else — done
    }
  } finally {
    rl.close();
  }
}
