import chalk from "chalk";
import ora from "ora";
import type {
  ScoreResult,
  Detection,
  CategoryScore,
  TaxonomyCategory,
} from "../types.js";
import { CATEGORY_EMOJI, CATEGORY_LABELS, TAXONOMY_CATEGORIES } from "../types.js";
import { getNextTier } from "../scoring/tiers.js";

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

export function createSpinner(text: string) {
  return ora({ text, spinner: "dots" });
}

export function renderResults(
  score: ScoreResult,
  detections: Detection[]
): void {
  console.log();

  // Header
  const levelStr = chalk.bold.white(`Level ${score.level}`);
  const tierStr = chalk.bold.cyan(score.tier.title);
  const typeStr = chalk.dim(`[${score.typeCode.code}]`);
  console.log(
    `  ${levelStr} ${tierStr} ${typeStr}`
  );
  console.log(`  ${chalk.dim(score.tier.tagline)}`);
  console.log();

  // Category table
  console.log(chalk.bold("  Categories"));
  console.log(chalk.dim("  " + "-".repeat(52)));

  const catMap = new Map<TaxonomyCategory, CategoryScore>(
    score.categories.map((c) => [c.category, c])
  );

  for (const cat of TAXONOMY_CATEGORIES) {
    const cs = catMap.get(cat)!;
    const emoji = CATEGORY_EMOJI[cat];
    const label = CATEGORY_LABELS[cat].padEnd(14);
    const scoreStr = scoreColor(cs.score)(
      String(cs.score).padStart(3)
    );
    const countStr = chalk.dim(`${cs.detectionCount} found`);
    const topStr = cs.detectionCount > 0 ? tierBadge(cs.topTier) : chalk.dim("--");
    console.log(
      `  ${emoji} ${label} ${scoreStr}/100  ${countStr}  ${topStr}`
    );
  }
  console.log();

  // Detection list grouped by category
  console.log(chalk.bold("  Detections"));
  console.log(chalk.dim("  " + "-".repeat(52)));

  for (const cat of TAXONOMY_CATEGORIES) {
    const catDetections = detections.filter(
      (d) => d.category === cat
    );
    if (catDetections.length === 0) continue;

    console.log(
      `  ${CATEGORY_EMOJI[cat]} ${chalk.bold(CATEGORY_LABELS[cat])}`
    );
    for (const d of catDetections) {
      const badge = tierBadge(d.tier);
      const innovation =
        d.taxonomyMatch === null ? chalk.yellow(" *") : "";
      const conf =
        d.confidence === "low" ? chalk.dim(" (low)") : "";
      console.log(
        `     ${badge} ${d.name}${innovation}${conf}`
      );
      console.log(`       ${chalk.dim(d.source)}`);
    }
  }
  console.log();

  // Pioneer badge
  if (score.pioneer.isPioneer) {
    console.log(
      chalk.yellow.bold("  ★ Pioneer Badge")
    );
    console.log(
      chalk.yellow(
        `    ${score.pioneer.innovations.length} innovation(s) detected`
      )
    );
    for (const inn of score.pioneer.innovations) {
      console.log(
        chalk.yellow(`    → ${inn.name} (${inn.source})`)
      );
    }
    console.log();
  }

  // Improvement hints
  const weakest = [...score.categories]
    .filter((c) => c.score < 50)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  if (weakest.length > 0) {
    console.log(chalk.bold("  Growth areas"));
    for (const w of weakest) {
      console.log(
        `  ${chalk.dim("→")} ${CATEGORY_LABELS[w.category]}: ${w.score}/100`
      );
    }
    console.log();
  }

  // Next tier hint
  const next = getNextTier(score.tier.title);
  if (next) {
    console.log(
      chalk.dim(
        `  Next tier: ${next.title} (level ${next.minLevel}+)`
      )
    );
    console.log();
  }
}
