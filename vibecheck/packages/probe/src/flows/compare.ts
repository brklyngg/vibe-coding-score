import type { Interface as RLInterface } from "node:readline/promises";
import type { ProbeResult } from "@vibe/scoring";
import chalk from "chalk";
import { submitResult } from "./submit.js";

export interface CompareResult {
  code?: string;
  url?: string;
  error?: string;
}

export async function compareApi(opts: {
  action: "create" | "join";
  handle: string;
  code?: string;
  url: string;
}): Promise<CompareResult> {
  const payload: Record<string, string> = { action: opts.action, handle: opts.handle };
  if (opts.action === "join" && opts.code) {
    payload.code = opts.code;
  }

  try {
    const res = await fetch(`${opts.url}/api/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return (await res.json()) as CompareResult;
    }
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    return { error: body.error ?? res.statusText };
  } catch {
    return { error: `Could not reach ${opts.url}` };
  }
}

export async function interactiveCompare(
  rl: RLInterface,
  result: ProbeResult,
  url: string,
): Promise<void> {
  // Step 1: submit the result
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

  // Step 2: ask if they have a code already
  const answer = await rl.question(
    `\n  Do you have a compare code from a friend? [code/N] `
  );
  const trimmed = answer.trim().toLowerCase();

  if (trimmed && trimmed !== "n") {
    // Join existing comparison
    if (!/^[a-z0-9]{6}$/.test(trimmed)) {
      console.error(chalk.red("  Code must be 6 lowercase hex characters."));
      return;
    }

    const cmpResult = await compareApi({
      action: "join",
      handle: submitOutcome.handle,
      code: trimmed,
      url,
    });

    if (cmpResult.error) {
      console.error(chalk.red(`  Compare failed: ${cmpResult.error}`));
      return;
    }

    console.log();
    console.log(`  ${chalk.green("✓")} Joined comparison ${chalk.bold(trimmed)}`);
    console.log();
    console.log(`  View the comparison:`);
    console.log(`    ${chalk.cyan(cmpResult.url)}`);
    console.log();
  } else {
    // Create new comparison
    const cmpResult = await compareApi({
      action: "create",
      handle: submitOutcome.handle,
      url,
    });

    if (cmpResult.error) {
      console.error(chalk.red(`  Compare failed: ${cmpResult.error}`));
      return;
    }

    const sep = "─".repeat(42);
    console.log();
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
