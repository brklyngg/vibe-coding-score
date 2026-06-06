// Duplicated from probe/src/scoring/engine.ts — extract to shared package when a third consumer appears

import {
  type Detection,
  type CategoryScore,
  type ScoreResult,
  type TypeCode,
  type PioneerStatus,
  type TaxonomyCategory,
  type TierTitle,
  TAXONOMY_CATEGORIES,
  CATEGORY_WEIGHTS,
  TIER_POINTS,
  TIER_TITLES,
} from "./types";

export function computeCategoryScores(detections: Detection[]): CategoryScore[] {
  return TAXONOMY_CATEGORIES.map((category) => {
    const categoryDetections = detections.filter((d) => d.category === category);
    if (categoryDetections.length === 0) {
      return { category, score: 0, detectionCount: 0, topTier: "basic" as const };
    }

    let raw = 0;
    let topTier: Detection["tier"] = "basic";
    const tierRank = { basic: 0, intermediate: 1, advanced: 2, elite: 3 };

    for (const d of categoryDetections) {
      raw += TIER_POINTS[d.tier];
      if (tierRank[d.tier] > tierRank[topTier]) {
        topTier = d.tier;
      }
    }

    for (const d of categoryDetections) {
      if (d.taxonomyMatch === null) {
        if (d.confidence === "high") raw += 3;
        else if (d.confidence === "medium") raw += 1;
      }
    }

    return {
      category,
      score: Math.min(100, raw),
      detectionCount: categoryDetections.length,
      topTier,
    };
  });
}

export function computeLevel(categories: CategoryScore[]): number {
  const scoreMap = new Map(categories.map((c) => [c.category, c.score]));
  let level = 0;
  for (const cat of TAXONOMY_CATEGORIES) {
    const score = scoreMap.get(cat) ?? 0;
    level += score * CATEGORY_WEIGHTS[cat];
  }
  return Math.round(Math.min(100, Math.max(0, level)));
}

export function assignTier(level: number): { title: TierTitle; tagline: string } {
  for (const t of TIER_TITLES) {
    if (level >= t.min && level <= t.max) {
      return { title: t.title, tagline: t.tagline };
    }
  }
  return { title: TIER_TITLES[TIER_TITLES.length - 1].title, tagline: TIER_TITLES[TIER_TITLES.length - 1].tagline };
}

export function computeTypeCode(categories: CategoryScore[]): TypeCode {
  const scoreOf = (cat: TaxonomyCategory): number =>
    categories.find((c) => c.category === cat)?.score ?? 0;

  const intelligence = scoreOf("intelligence") >= 50 ? "M" : "V";
  const autonomy = scoreOf("autonomy") >= 50 ? "A" : "G";
  const ship = scoreOf("ship") >= 50 ? "R" : "C";

  const avgDepth = (scoreOf("tooling") + scoreOf("continuity") + scoreOf("ops")) / 3;
  const depth = avgDepth >= 50 ? "D" : "L";

  return { code: `${intelligence}${autonomy}${ship}${depth}`, intelligence, autonomy, ship, depth };
}

export function evaluatePioneer(detections: Detection[]): PioneerStatus {
  const innovations = detections.filter((d) => d.taxonomyMatch === null);
  const highConfidenceCount = innovations.filter((d) => d.confidence === "high").length;
  const mediumConfidenceCount = innovations.filter((d) => d.confidence === "medium").length;

  return {
    isPioneer: highConfidenceCount >= 1 || mediumConfidenceCount >= 3,
    highConfidenceCount,
    mediumConfidenceCount,
    innovations,
  };
}

export function computeScore(detections: Detection[]): ScoreResult {
  const categories = computeCategoryScores(detections);
  const level = computeLevel(categories);
  const tier = assignTier(level);
  const typeCode = computeTypeCode(categories);
  const pioneer = evaluatePioneer(detections);

  return { level, categories, tier, typeCode, pioneer };
}
