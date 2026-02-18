import type { Interface as RLInterface } from "node:readline/promises";
import type { Detection, ProbeResult } from "@vibe/scoring";
import { computeScore } from "@vibe/scoring";
import chalk from "chalk";
import { submitResult } from "./submit.js";
import { renderResults, createSpinner } from "../output/terminal.js";
import { interactiveCompare } from "./compare.js";
import { openBrowser } from "../utils/open.js";

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

  // Cancel listener — extracted so finally{} can clean it up
  const onData = () => { cancelled = true; };
  let cleanupTimer: ReturnType<typeof setTimeout> | undefined;

  if (process.stdin.isTTY) {
    process.stdin.once("data", onData);
    cleanupTimer = setTimeout(() => {
      process.stdin.removeListener("data", onData);
    }, timeoutMs);
  }

  try {
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
        new Promise<void>((resolve) => {
          const check = setInterval(() => {
            if (cancelled) { clearInterval(check); resolve(); }
          }, 200);
          setTimeout(() => { clearInterval(check); resolve(); }, intervalMs);
        }),
      ]);
    }
    return null;
  } finally {
    // Always clean up — prevents dangling listener from eating readline input
    process.stdin.removeListener("data", onData);
    if (cleanupTimer) clearTimeout(cleanupTimer);
  }
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
  console.log(`  ${chalk.gray("Or share this context with your AI assistant:")}`);
  console.log();
  console.log(`    ${chalk.dim("Vibe Coder Score: scan your AI coding setup and compare scores.")}`);
  console.log();
  console.log(`    ${chalk.dim("This runs a read-only probe (open source: github.com/brklyngg/vibe-coding-score)")}`);
  console.log(`    ${chalk.dim("that checks which AI tools, MCP servers, and configs you have installed.")}`);
  console.log(`    ${chalk.dim("Nothing is modified. Nothing is sent over the network during the scan.")}`);
  console.log(`    ${chalk.dim("The --merge-from flag combines your results with theirs for a unified score.")}`);
  console.log();
  console.log(`    ${chalk.dim("To review the code first: npm info vibecheck-score")}`);
  console.log(`    ${chalk.dim(`To run: npx vibecheck-score --merge-from ${handle}`)}`);
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

    const mergedResult: ProbeResult = {
      ...result,
      detections: mergedDetections,
      score: combinedScore,
    };

    // Submit merged result to get updated analysis URL
    const mergeSubmit = await submitResult({
      result: mergedResult,
      url,
      skipConfirm: true,
      silent: true,
    });

    const mergedAnalysisUrl = mergeSubmit.success && mergeSubmit.url && mergeSubmit.token
      ? `${mergeSubmit.url}?token=${mergeSubmit.token}`
      : null;

    if (mergedAnalysisUrl) {
      console.log(`  ${chalk.green("✓")} Updated analysis: ${chalk.cyan(mergedAnalysisUrl)}`);
      console.log();
    }

    // Post-merge menu loop
    let browserOpened = false;
    let compareAvailable = true;

    while (true) {
      const postSep = "─".repeat(42);
      console.log();
      console.log(`  ${chalk.bold.white("WHAT'S NEXT?")}`);
      console.log(`  ${chalk.gray(postSep)}`);
      if (compareAvailable) {
        console.log(`  ${chalk.white("[1]")} Compare with a friend/colleague`);
      }
      if (mergedAnalysisUrl && !browserOpened) {
        console.log(`  ${chalk.green("[Enter]")} View your full analysis in browser`);
      } else {
        console.log(`  ${chalk.white("[Enter]")} Done`);
      }
      console.log(`  ${chalk.gray(postSep)}`);

      const answer = await rl.question(`\n  Choice: `);
      const choice = answer.trim();

      if (choice === "1" && compareAvailable) {
        await interactiveCompare(rl, mergedResult, url);
        compareAvailable = false;
        if (mergedAnalysisUrl) {
          const label = "Your AI-powered analysis is ready:";
          const width = Math.max(label.length, mergedAnalysisUrl.length) + 4;
          const border = "─".repeat(width);
          console.log();
          console.log(`  ${chalk.green("┌" + border + "┐")}`);
          console.log(`  ${chalk.green("│")}  ${chalk.bold.white(label)}${" ".repeat(width - label.length - 2)}${chalk.green("│")}`);
          console.log(`  ${chalk.green("│")}  ${chalk.cyan(mergedAnalysisUrl)}${" ".repeat(width - mergedAnalysisUrl.length - 2)}${chalk.green("│")}`);
          console.log(`  ${chalk.green("└" + border + "┘")}`);
        }
      } else {
        // Enter or unrecognized
        if (mergedAnalysisUrl && !browserOpened) {
          openBrowser(mergedAnalysisUrl);
          browserOpened = true;
          if (!compareAvailable) break;
          // Loop back to show remaining options
        } else {
          break;
        }
      }

      if (!compareAvailable && browserOpened) break;
    }

    return mergedResult;
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
