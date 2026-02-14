import { randomUUID, randomBytes } from "node:crypto";
import { homedir } from "node:os";
import { join } from "node:path";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import type { ProbeResult } from "@vibe/scoring";

const HANDLE_RE = /^[a-z0-9_-]{3,39}$/;

export interface SubmitOpts {
  result: ProbeResult;
  handle?: string;
  url: string;
  skipConfirm?: boolean;
  silent?: boolean;
}

export interface SubmitOutcome {
  success: boolean;
  handle: string;
  url?: string;
  error?: string;
}

function getOrCreateToken(): string {
  const tokenDir = join(homedir(), ".vibecheck");
  const tokenPath = join(tokenDir, "token");
  if (existsSync(tokenPath)) {
    return readFileSync(tokenPath, "utf-8").trim();
  }
  const token = randomUUID();
  mkdirSync(tokenDir, { recursive: true });
  writeFileSync(tokenPath, token, { mode: 0o600 });
  return token;
}

export async function submitResult(opts: SubmitOpts): Promise<SubmitOutcome> {
  const handle = opts.handle ?? randomBytes(4).toString("hex");

  if (opts.handle && !HANDLE_RE.test(opts.handle)) {
    return {
      success: false,
      handle,
      error: "--handle must be 3-39 chars, lowercase alphanumeric/hyphens/underscores",
    };
  }

  // Confirmation prompt (unless skipped)
  if (!opts.skipConfirm && !opts.silent) {
    const rl = await import("node:readline/promises").then((m) =>
      m.createInterface({ input: process.stdin, output: process.stdout })
    );
    const answer = await rl.question(
      `\n  Submit results as \x1b[1m${handle}\x1b[0m to ${opts.url.replace("https://", "")}? [Y/n] `
    );
    rl.close();
    if (answer.trim().toLowerCase() === "n") {
      return { success: false, handle, error: "skipped" };
    }
  }

  const submissionToken = getOrCreateToken();

  try {
    const res = await fetch(`${opts.url}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, probeResult: opts.result, submissionToken }),
    });

    if (res.ok) {
      const body = (await res.json()) as { url: string };
      if (!opts.silent) {
        const inner = `  \x1b[32m✓\x1b[0m Published! Share your score:`;
        const urlLine = `  ${body.url}`;
        const width = Math.max(inner.length - 9, urlLine.length) + 4;
        const border = "─".repeat(width);
        console.log(`\n  \x1b[32m┌${border}┐\x1b[0m`);
        console.log(`  \x1b[32m│\x1b[0m ${inner.padEnd(width - 2)} \x1b[32m│\x1b[0m`);
        console.log(`  \x1b[32m│\x1b[0m ${urlLine.padEnd(width - 2)} \x1b[32m│\x1b[0m`);
        console.log(`  \x1b[32m└${border}┘\x1b[0m\n`);
      }
      return { success: true, handle, url: body.url };
    } else if (res.status === 403) {
      const msg = "This handle is owned by a different machine.";
      if (!opts.silent) {
        console.error(`\n  \x1b[31m✗ ${msg}\x1b[0m`);
        console.error(
          "  If this is your handle, restore ~/.vibecheck/token from the original machine.\n"
        );
      }
      return { success: false, handle, error: msg };
    } else {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      const msg = body.error ?? res.statusText;
      if (!opts.silent) {
        console.error(`\n  \x1b[31m✗ Submit failed: ${msg}\x1b[0m\n`);
      }
      return { success: false, handle, error: msg };
    }
  } catch {
    const msg = `Could not reach ${opts.url}`;
    if (!opts.silent) {
      console.error(`\n  \x1b[33m⚠ ${msg} — results saved locally only.\x1b[0m\n`);
    }
    return { success: false, handle, error: msg };
  }
}
