import type { ProbeResult } from "@vibe/scoring";

const ALLOWED_NUMERIC_KEYS = new Set([
  "count",
  "ratio",
  "commitsPerWeek",
  "last30d",
  "worktreeCount",
  "hookCount",
  "smallPct",
  "largePct",
  "morning",
  "afternoon",
  "evening",
  "night",
]);

const ALLOWED_STRING_KEYS = new Set([
  "pattern", // "night_owl", "early_bird" — enum-like, non-sensitive
]);

function stripDetails(
  details?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!details) return undefined;
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(details)) {
    if (ALLOWED_NUMERIC_KEYS.has(k) && typeof v === "number") {
      clean[k] = v;
    } else if (ALLOWED_STRING_KEYS.has(k) && typeof v === "string") {
      clean[k] = v;
    }
  }
  return Object.keys(clean).length > 0 ? clean : undefined;
}

function normalizeSource(source: string): string {
  if (/^~\/\.(zshrc|bashrc|zprofile|bash_profile)$/.test(source))
    return "shell-config";
  if (source === "crontab") return "crontab";
  if (source.includes(".claude/agents")) return "agents-dir";
  if (source.includes(".claude/skills")) return "skills-dir";
  if (source.includes(".claude/commands")) return "commands-dir";
  if (source.includes("LaunchAgents")) return "launch-agents";
  if (source.includes(".claude/memories")) return "memories-dir";
  // Safe sources pass through: .gitignore, package.json, git-history, "which" commands, etc.
  return source;
}

/** Strip sensitive details from probeResult before network submission.
 *  IMPORTANT: Does NOT mutate the input — returns a new object. */
export function sanitizeForSubmit(result: ProbeResult): ProbeResult {
  const { platform: _platform, ...rest } = result;
  return {
    ...rest,
    platform: "redacted",
    scanResults: result.scanResults.map((sr) => ({
      scanner: sr.scanner,
      detections: [],
      duration: sr.duration,
    })),
    detections: result.detections.map((d) => ({
      ...d,
      source: normalizeSource(d.source),
      details: stripDetails(d.details),
    })),
  };
}
