import type { TierTitle, TaxonomyCategory, ScoreResult, Detection } from "@vibe/scoring";
import { CATEGORY_LABELS } from "@vibe/scoring";

// -- Tier taglines (from audio overview, validated by Gary) --

export const TIER_TAGLINES: Record<TierTitle, string> = {
  Observer: "A tourist in the land of code",
  Apprentice: "The AI is just a very chatty GPS",
  Practitioner: "You crossed into YOLO mode",
  Builder: "The AI becomes a partner",
  Operator: "You stop typing syntax. You become a manager",
  Commander: "Managing a parallel workforce",
  Architect: "You aren't coding anymore",
  Orchestrator: "Orchestrating a system of digital workers",
  Industrialist: "A self-sustaining software factory",
};

// -- Pioneer narrative hooks --

export const PIONEER_TAGLINE = "Off the map. Building what comes next.";

export const PIONEER_HOOKS: Record<string, string> = {
  customMcp: "Built a custom MCP server — extending the AI's reach into new territory.",
  novelArchitecture: "Designed an agent architecture the taxonomy hasn't seen before.",
  taxonomyBreaker: "Running patterns that forced us to update our understanding of what's possible.",
  ecosystemContributor: "Publishing tools that other developers use. Producer, not just consumer.",
  unconventionalIntegration: "Connected AI to unexpected domains in ways we haven't seen before.",
};

// -- Dimension commentary templates (placeholder slots for Phase 4) --

export const DIMENSION_COMMENTARY = {
  intelligence: {
    low: "Single model, default config. The foundation is there — just needs breadth.",
    mid: "Solid model strategy. You're making deliberate choices about which AI handles what.",
    high: "Multi-model mastery with routing logic. You treat models like a portfolio, not a monogamy.",
  },
  tooling: {
    low: "Light on tools. There's a whole ecosystem of MCP servers waiting to supercharge your setup.",
    mid: "Good tool coverage. Your MCP servers extend the AI's reach meaningfully.",
    high: "Deep tool ecosystem. Custom MCP servers, comprehensive coverage — you're a producer, not just a consumer.",
  },
  continuity: {
    low: "No memory system. Your AI starts fresh every session — a brilliant goldfish.",
    mid: "You've solved basic continuity. The AI remembers what matters across sessions.",
    high: "Multi-layer memory architecture. Daily logs, curated long-term, active work tracking — this is institutional memory.",
  },
  autonomy: {
    low: "Purely reactive. The AI waits for your every command.",
    mid: "Your agents have some independence. Subagents and scheduled tasks are in play.",
    high: "Full agent workforce. Proactive work loops, specialized roles, agents that find their own tasks.",
  },
  ship: {
    low: "Manual deploy or basic push-to-deploy. The pipeline needs work.",
    mid: "CI/CD with tests and automated deploy. Professional-grade shipping.",
    high: "AI-integrated pipeline. Agent-opened PRs, merge queues, quality gates — a shipping machine.",
  },
  security: {
    low: "Security gaps visible. Secrets management and agent permissions need attention.",
    mid: "Good hygiene. Gitignored secrets, environment variables, some permission scoping.",
    high: "Comprehensive security model. Canary tokens, permission governance, prompt injection defense.",
  },
  ops: {
    low: "Minimal operational infrastructure. Documentation and project management are informal.",
    mid: "Task tracking and good docs. The operational backbone is solid.",
    high: "AI-integrated operations. Maintenance agents, monitoring, automated documentation.",
  },
  social: {
    low: "Solo setup. No community integration or multi-channel presence.",
    mid: "Some community engagement. Communication channels or shared configs.",
    high: "Full social integration. Published tools, multi-channel AI presence, community builder.",
  },
} as const;

// -- Web helpers (ported from probe's narrative.ts + tiers.ts) --

const IMPROVEMENT_HINTS: Partial<Record<TaxonomyCategory, string>> = {
  ship: "Add a GitHub Actions workflow or deploy config to level up.",
  tooling: "Try connecting an MCP server — filesystem or GitHub are great starters.",
  continuity: "Add a CLAUDE.md to your project root so the AI remembers your conventions.",
  security: "Make sure .env is in your .gitignore and review agent permissions.",
  ops: "Add build/dev/lint scripts to package.json for a quick ops boost.",
};

export function commentaryForScoreWeb(
  cat: TaxonomyCategory,
  score: number
): string {
  const c = DIMENSION_COMMENTARY[cat];
  if (score >= 60) return c.high;
  if (score >= 30) return c.mid;
  return c.low;
}

export function generateNarrativeWeb(
  score: ScoreResult,
  detections: Detection[]
): string {
  const sorted = [...score.categories].sort((a, b) => b.score - a.score);
  const strongest = sorted[0];
  const weakCandidates = sorted.filter((c) => c.score < 50);
  const weakest =
    weakCandidates.length > 0
      ? weakCandidates[weakCandidates.length - 1]
      : undefined;

  const sentences: string[] = [];
  sentences.push(commentaryForScoreWeb(strongest.category, strongest.score));

  if (weakest && weakest.category !== strongest.category) {
    const hint = IMPROVEMENT_HINTS[weakest.category];
    if (hint && weakest.score < 30) {
      sentences.push(hint);
    } else {
      sentences.push(
        `${CATEGORY_LABELS[weakest.category]} is your biggest growth area.`
      );
    }
  }

  const mcpCount = detections.filter((d) => d.id.startsWith("mcp-")).length;
  if (mcpCount > 3) {
    sentences.push(
      `${mcpCount} MCP servers connected — that's serious tool integration.`
    );
  }

  if (score.pioneer.isPioneer) {
    sentences.push(
      "Pioneer badge earned — you're building what the taxonomy hasn't seen yet."
    );
  }

  return sentences.join(" ");
}

