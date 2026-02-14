import chalk from "chalk";
import ora from "ora";
import type {
  ScoreResult,
  Detection,
  TaxonomyCategory,
} from "@vibe/scoring";
import { CATEGORY_EMOJI, CATEGORY_LABELS, TAXONOMY_CATEGORIES } from "@vibe/scoring";
import { getNextTier } from "../scoring/tiers.js";
import { generateNarrative } from "./narrative.js";
import { commentaryForScore } from "./narrative.js";

const HEAVY_SEP = "━".repeat(53);
const LIGHT_SEP = "─".repeat(52);
const INDENT = "  ";

function scoreColor(score: number): (text: string) => string {
  if (score >= 50) return chalk.green;
  if (score >= 25) return chalk.yellow;
  return chalk.red;
}

function tierBadge(tier: string): string {
  const badges: Record<string, string> = {
    basic: chalk.gray("[basic]"),
    intermediate: chalk.cyan("[inter]"),
    advanced: chalk.magenta("[adv]"),
    elite: chalk.yellow("[elite]"),
  };
  return badges[tier] ?? chalk.gray(`[${tier}]`);
}

function renderTaxonomyTable(
  detections: Detection[],
  durationMs?: number
): string {
  const lines: string[] = [];
  const catW = 14;
  const nameW = 40;

  // Group detections by category in taxonomy order
  const grouped = new Map<TaxonomyCategory, Detection[]>();
  for (const d of detections) {
    const list = grouped.get(d.category) ?? [];
    list.push(d);
    grouped.set(d.category, list);
  }

  let categoryCount = 0;
  let hasInnovations = false;
  for (const cat of TAXONOMY_CATEGORIES) {
    const items = grouped.get(cat);
    if (!items || items.length === 0) continue;
    categoryCount++;

    for (let i = 0; i < items.length; i++) {
      const d = items[i];
      const catLabel = i === 0 ? CATEGORY_LABELS[cat] : "";
      const truncName = d.name.length > nameW ? d.name.slice(0, nameW - 1) + "…" : d.name;
      const badge = tierBadge(d.tier);
      const innovation = d.taxonomyMatch === null ? chalk.yellow(" *") : "";
      if (d.taxonomyMatch === null) hasInnovations = true;
      lines.push(`${INDENT}  ${catLabel.padEnd(catW)} ${truncName.padEnd(nameW)} ${badge}${innovation}`);
    }
  }

  // Footer
  const scanTime = durationMs ? ` · scanned in ${(durationMs / 1000).toFixed(1)}s` : "";
  lines.push(chalk.gray(`${INDENT}  ${detections.length} signals · ${categoryCount} categories${scanTime}`));
  if (hasInnovations) {
    lines.push(chalk.gray("  * = novel detection (not in standard registry)"));
  }

  return lines.join("\n");
}

function renderKeyMechanisms(detections: Detection[]): string {
  const lines: string[] = [];

  // Named mechanisms: detections with details.names
  const named = detections.filter(
    (d) => d.details?.names && Array.isArray(d.details.names) && (d.details.names as string[]).length > 0
  );

  // Pattern bonuses: id starts with "pattern:"
  const patterns = detections.filter((d) => d.id.startsWith("pattern:"));

  if (named.length === 0 && patterns.length === 0) return "";

  lines.push(`${INDENT}${chalk.bold.white("KEY MECHANISMS")}`);
  lines.push(`${INDENT}${chalk.gray(LIGHT_SEP)}`);
  lines.push("");

  for (const d of named) {
    const names = d.details!.names as string[];
    const maxShow = 6;
    const shown = names.slice(0, maxShow).join(", ");
    const more = names.length > maxShow ? ` +${names.length - maxShow} more` : "";
    lines.push(`${INDENT}  ${chalk.white(d.name)}: ${chalk.gray(shown + more)}`);
  }

  // Deduplicate patterns — only show the primary emission (not :ops, :continuity suffixes)
  const seenPatterns = new Set<string>();
  for (const d of patterns) {
    const base = d.id.includes(":") ? d.id.split(":").slice(0, 2).join(":") : d.id;
    if (seenPatterns.has(base)) continue;
    seenPatterns.add(base);
    lines.push(`${INDENT}  ${chalk.yellow("★")} ${chalk.white(d.name)}`);
  }

  lines.push("");
  return lines.join("\n");
}

export function createSpinner(text: string) {
  return ora({ text, spinner: "dots" });
}

export function renderResults(
  score: ScoreResult,
  detections: Detection[],
  durationMs?: number
): void {
  console.log();

  // 1. Top separator
  console.log(`${INDENT}${chalk.gray(HEAVY_SEP)}`);
  console.log();

  // 2. VIBE CODER SCORE header
  console.log(`${INDENT}${chalk.bold.white("VIBE CODER SCORE")}`);
  console.log();

  // 3. Level · TierTitle + tagline (no archetype box, no letter code)
  const levelStr = `Level ${score.level}`;
  const tierStr = score.tier.title;
  console.log(`${INDENT}${chalk.bold.white(`${levelStr} · ${tierStr}`)}`);
  console.log(`${INDENT}${chalk.gray(`"${score.tier.tagline}"`)}`);
  console.log();

  // 4. Narrative text
  const narrative = generateNarrative(score, detections);
  console.log(`${INDENT}${chalk.white(narrative)}`);
  console.log();

  // 5. Category bar chart
  const catMap = new Map<TaxonomyCategory, number>(
    score.categories.map((c) => [c.category, c.score])
  );

  for (const cat of TAXONOMY_CATEGORIES) {
    const s = catMap.get(cat) ?? 0;
    const label = CATEGORY_LABELS[cat].padEnd(12);
    const filled = Math.round(s / 10);
    const empty = 10 - filled;
    const bar = scoreColor(s)("█".repeat(filled)) + chalk.gray("░".repeat(empty));
    const scoreStr = chalk.bold.white(String(s).padStart(3));
    console.log(`${INDENT}  ${label}  ${bar}  ${scoreStr}`);
  }
  console.log();

  // 6. WHAT WE FOUND + taxonomy table
  console.log(`${INDENT}${chalk.bold.white("WHAT WE FOUND")}`);
  console.log(`${INDENT}${chalk.gray(LIGHT_SEP)}`);
  console.log();
  console.log(renderTaxonomyTable(detections, durationMs));
  console.log();

  // 7. Key mechanisms (named agents/skills/commands + pattern bonuses)
  const keyMech = renderKeyMechanisms(detections);
  if (keyMech) {
    console.log(keyMech);
  }

  // 8. Pioneer badge (if earned) — moved down
  if (score.pioneer.isPioneer) {
    console.log(
      `${INDENT}${chalk.yellow.bold("★ Pioneer Badge")}`
    );
    console.log(
      `${INDENT}${chalk.yellow(`  ${score.pioneer.innovations.length} innovation(s) detected`)}`
    );
    for (const inn of score.pioneer.innovations) {
      console.log(
        `${INDENT}${chalk.yellow(`  → ${inn.name}`)}`
      );
    }
    console.log();
  }

  // 9. GROWTH AREAS + commentary
  const weakest = [...score.categories]
    .filter((c) => c.score < 50)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  if (weakest.length > 0) {
    console.log(`${INDENT}${chalk.bold.white("GROWTH AREAS")}`);
    console.log(`${INDENT}${chalk.gray(LIGHT_SEP)}`);
    console.log();
    for (const w of weakest) {
      const emoji = CATEGORY_EMOJI[w.category];
      console.log(`${INDENT}  ${emoji} ${chalk.white(CATEGORY_LABELS[w.category])} ${chalk.gray(`(${w.score}/100)`)}`);
      console.log(`${INDENT}    ${chalk.gray(commentaryForScore(w.category, w.score))}`);
    }
    console.log();
  }

  // 10. Next tier hint
  const next = getNextTier(score.tier.title);
  if (next) {
    console.log(
      `${INDENT}${chalk.gray(`Next tier: ${next.title} (level ${next.minLevel}+)`)}`
    );
    console.log();
  }

  // 11. Bottom separator
  console.log(`${INDENT}${chalk.gray(HEAVY_SEP)}`);
  console.log();
}
