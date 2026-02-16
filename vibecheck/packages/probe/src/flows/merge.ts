import type { Interface as RLInterface } from "node:readline/promises";
import type { Detection, ProbeResult } from "@vibe/scoring";
import { computeScore } from "@vibe/scoring";
import chalk from "chalk";
import { submitResult } from "./submit.js";
import { renderResults, createSpinner } from "../output/terminal.js";
import { interactiveCompare } from "./compare.js";

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

async function pollForMergedResult(
  handle: string,
  url: string,
  timeoutMs: number = 300_000,
  intervalMs: number = 5_000,
): Promise<Detection[] | null> {
  const mergedHandle = `${handle}-merged`;
  const deadline = Date.now() + timeoutMs;
  let cancelled = false;

  // Allow cancel via Enter keypress
  const cancelPromise = new Promise<void>((resolve) => {
    if (!process.stdin.isTTY) {
      resolve();
      return;
    }
    const onData = () => {
      cancelled = true;
      process.stdin.removeListener("data", onData);
      resolve();
    };
    process.stdin.once("data", onData);
    // Clean up listener at deadline
    setTimeout(() => {
      process.stdin.removeListener("data", onData);
      resolve();
    }, timeoutMs);
  });

  while (Date.now() < deadline && !cancelled) {
    try {
      const detections = await fetchRemoteDetections(mergedHandle, url);
      return detections;
    } catch {
      // 404 or other error — not ready yet
    }
    // Wait intervalMs or until cancelled
    await Promise.race([
      new Promise((r) => setTimeout(r, intervalMs)),
      cancelPromise,
    ]);
  }

  return null;
}

export async function interactiveMerge(
  rl: RLInterface,
  result: ProbeResult,
  url: string,
): Promise<ProbeResult | null> {
  // Submit current scan
  const submitOutcome = await submitResult({
    result,
    url,
    skipConfirm: true,
    silent: true,
  });

  if (!submitOutcome.success) {
    console.error(chalk.red(`  Submit failed: ${submitOutcome.error}`));
    return null;
  }

  const handle = submitOutcome.handle;
  const sep = "─".repeat(42);
  console.log();
  console.log(`  ${chalk.bold.white("MULTI-MACHINE MERGE")}`);
  console.log(`  ${chalk.gray(sep)}`);
  console.log(`  ${chalk.green("✓")} This scan submitted as ${chalk.bold(handle)}`);
  console.log();
  console.log(`  ${chalk.gray("On your other machine, run:")}`);
  console.log(`    ${chalk.cyan(`npx vibecheck-score --merge-from ${handle}`)}`);
  console.log();
  console.log(`  ${chalk.gray("Or paste this for your AI assistant:")}`);
  console.log();
  console.log(`    ${chalk.dim("Please execute the following command in your terminal, to participate")}`);
  console.log(`    ${chalk.dim(`in a Vibe Coder Score multi-machine merge at ${url}.`)}`);
  console.log(`    ${chalk.dim("Before you run it, make sure you understand what it is and flag if")}`);
  console.log(`    ${chalk.dim("anything is unsafe prior to proceeding.")}`);
  console.log();
  console.log(`    ${chalk.dim(`Run: npx vibecheck-score --merge-from ${handle}`)}`);
  console.log();
  console.log(`  ${chalk.gray(sep)}`);
  console.log();

  // Poll for merged results from Machine B
  console.log(`  ${chalk.yellow("⏳")} Waiting for the other machine... ${chalk.gray("(press Enter to skip)")}`);
  const spinner = createSpinner("Polling for merged results...");
  spinner.start();

  // Set stdin to raw-ish mode so we can detect Enter
  const wasRaw = process.stdin.isRaw;
  if (process.stdin.isTTY && process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();

  const mergedDetections = await pollForMergedResult(handle, url);

  // Restore stdin state
  if (process.stdin.isTTY && process.stdin.setRawMode) {
    process.stdin.setRawMode(wasRaw ?? false);
  }

  spinner.stop();

  if (mergedDetections) {
    const localCount = result.detections.length;
    const newSignals = mergedDetections.length - localCount;
    console.log(`  ${chalk.green("✓")} Other machine merged — ${chalk.bold(String(newSignals > 0 ? newSignals : mergedDetections.length))} new signals received`);
    console.log();

    // Compute and render combined results
    const combinedScore = computeScore(mergedDetections);
    renderResults(combinedScore, mergedDetections);

    // Post-merge compare option
    const postSep = "─".repeat(42);
    console.log();
    console.log(`  ${chalk.bold.white("WHAT'S NEXT?")}`);
    console.log(`  ${chalk.gray(postSep)}`);
    console.log(`  ${chalk.white("[1]")} Compare with a friend/colleague`);
    console.log(`  ${chalk.white("[2]")} Done ${chalk.gray("(or press Enter)")}`);
    console.log(`  ${chalk.gray(postSep)}`);

    const answer = await rl.question(`\n  Choice: `);
    const choice = answer.trim();

    if (choice === "1") {
      const mergedResult: ProbeResult = {
        ...result,
        detections: mergedDetections,
        score: combinedScore,
      };
      await interactiveCompare(rl, mergedResult, url);
      return mergedResult;
    }

    return {
      ...result,
      detections: mergedDetections,
      score: combinedScore,
    };
  } else {
    // Cancelled or timed out
    console.log(`  No merged results yet.`);
    console.log();
    console.log(`  ${chalk.gray("Check later:")}`);
    console.log(`    ${chalk.cyan(`${url}/result/${handle}-merged`)}`);
    console.log();
    console.log(`  ${chalk.gray("Or merge manually:")}`);
    console.log(`    ${chalk.cyan(`npx vibecheck-score --merge-from ${handle}-merged`)}`);
    console.log();
    return null;
  }
}
