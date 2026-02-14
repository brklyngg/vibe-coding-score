import type { Interface as RLInterface } from "node:readline/promises";
import type { Detection, ProbeResult } from "@vibe/scoring";
import chalk from "chalk";
import { submitResult } from "./submit.js";

export async function fetchRemoteDetections(
  handle: string,
  url: string,
): Promise<Detection[]> {
  const res = await fetch(`${url}/api/result/${encodeURIComponent(handle)}/detections`);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  const body = (await res.json()) as { detections: Detection[] };
  return body.detections;
}

export async function interactiveMerge(
  rl: RLInterface,
  result: ProbeResult,
  url: string,
): Promise<void> {
  // Submit current scan
  const submitOutcome = await submitResult({
    result,
    url,
    skipConfirm: true,
    silent: true,
  });

  if (!submitOutcome.success) {
    console.error(chalk.red(`  Submit failed: ${submitOutcome.error}`));
    return;
  }

  const sep = "─".repeat(42);
  console.log();
  console.log(`  ${chalk.bold.white("MULTI-MACHINE MERGE")}`);
  console.log(`  ${chalk.gray(sep)}`);
  console.log(`  ${chalk.green("✓")} This scan submitted as ${chalk.bold(submitOutcome.handle)}`);
  console.log();
  console.log(`  ${chalk.gray("On your other machine, run:")}`);
  console.log(`    ${chalk.cyan(`npx vibecheck-score --merge-from ${submitOutcome.handle}`)}`);
  console.log();
  console.log(`  ${chalk.gray("Or paste this for your AI assistant:")}`);
  console.log(`    ${chalk.dim(`Run: npx vibecheck-score --merge-from ${submitOutcome.handle}`)}`);
  console.log(`  ${chalk.gray(sep)}`);
  console.log();
}
