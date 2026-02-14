import { TIER_TITLES, type TierTitle } from "@vibe/scoring";

export function getTierForLevel(level: number): { title: TierTitle; tagline: string } {
  for (const t of TIER_TITLES) {
    if (level >= t.min && level <= t.max) {
      return { title: t.title, tagline: t.tagline };
    }
  }
  return {
    title: TIER_TITLES[TIER_TITLES.length - 1].title,
    tagline: TIER_TITLES[TIER_TITLES.length - 1].tagline,
  };
}

export function getNextTier(
  currentTitle: TierTitle
): { title: TierTitle; tagline: string; minLevel: number } | null {
  const idx = TIER_TITLES.findIndex((t) => t.title === currentTitle);
  if (idx < 0 || idx >= TIER_TITLES.length - 1) return null;
  const next = TIER_TITLES[idx + 1];
  return { title: next.title, tagline: next.tagline, minLevel: next.min };
}
