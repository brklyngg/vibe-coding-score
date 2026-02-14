import type { ScoreResult, Detection, TaxonomyCategory } from "@vibe/scoring";
import { CATEGORY_LABELS } from "@vibe/scoring";

const DIMENSION_COMMENTARY: Record<
  TaxonomyCategory,
  { low: string; mid: string; high: string }
> = {
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
};

export const ARCHETYPE_NAMES: Record<string, string> = {
  MARD: "The Orchestrator",
  MARC: "The Methodist",
  MARL: "The Strategist",
  MACD: "The Planner",
  MACL: "The Analyst",
  MGRD: "The Engineer",
  MGRL: "The Pragmatist",
  MGCD: "The Sentinel",
  MGCL: "The Scholar",
  VARD: "The Powerhouse",
  VARL: "The Maverick",
  VACD: "The Experimenter",
  VACL: "The Freelancer",
  VGRD: "The Blitz Builder",
  VGRL: "The Scrapper",
  VGCD: "The Tinkerer",
  VGCL: "The Explorer",
};

export const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  MARD: "Deep model expertise, autonomous agents, rigorous shipping, and a deep tool ecosystem.",
  MARC: "Strategic model selection with autonomous agents, but shipping is measured and deliberate.",
  MARL: "Smart model strategy with autonomous agents and rapid shipping, but a lighter tool footprint.",
  MACD: "Master strategist with autonomous agents and deep tooling, but cautious on shipping.",
  MACL: "Strategic thinker with autonomous agents in a lean setup. Quality over quantity.",
  MGRD: "Model expertise paired with guided agents and rigorous process. You steer the ship.",
  MGRL: "Smart model use, guided agents, and rapid shipping with a lean stack.",
  MGCD: "Deep model knowledge, guided agents, cautious shipping, deep tools. The fortress.",
  MGCL: "Thoughtful model strategy in a guided, lean setup. Methodical and measured.",
  VARD: "Velocity-first with autonomous agents, rapid shipping, and deep tooling.",
  VARL: "Speed plus autonomy plus rapid shipping. Light on tools but heavy on output.",
  VACD: "Velocity seeker with autonomous agents, cautious shipping, and deep tools.",
  VACL: "Fast, autonomous, cautious, light. Moves fast but picks battles carefully.",
  VGRD: "Velocity is the vibe. Ships fast, integrates everything, but keeps the AI on a leash.",
  VGRL: "Fast, guided, rapid, light. Does more with less and ships it yesterday.",
  VGCD: "Velocity seeker who tinkers with deep tools under guided supervision.",
  VGCL: "Fast-moving, guided, cautious, and light. Just getting started, but moving quick.",
};

const IMPROVEMENT_HINTS: Partial<Record<TaxonomyCategory, string>> = {
  ship: "Add a GitHub Actions workflow or deploy config to level up.",
  tooling: "Try connecting an MCP server — filesystem or GitHub are great starters.",
  continuity: "Add a CLAUDE.md to your project root so the AI remembers your conventions.",
  security: "Make sure .env is in your .gitignore and review agent permissions.",
  ops: "Add build/dev/lint scripts to package.json for a quick ops boost.",
};

export function commentaryForScore(
  cat: TaxonomyCategory,
  score: number
): string {
  const c = DIMENSION_COMMENTARY[cat];
  if (score >= 60) return c.high;
  if (score >= 30) return c.mid;
  return c.low;
}

export function generateNarrative(
  score: ScoreResult,
  detections: Detection[]
): string {
  const sorted = [...score.categories].sort(
    (a, b) => b.score - a.score
  );
  const strongest = sorted[0];
  // Find weakest category with score < 50 (last in sorted = lowest score)
  const weakCandidates = sorted.filter((c) => c.score < 50);
  const weakest = weakCandidates.length > 0
    ? weakCandidates[weakCandidates.length - 1]
    : undefined;

  const sentences: string[] = [];

  // Strongest category commentary
  sentences.push(commentaryForScore(strongest.category, strongest.score));

  // Weakest category suggestion (with guardrail)
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

  // MCP count mention
  const mcpCount = detections.filter((d) =>
    d.id.startsWith("mcp-")
  ).length;
  if (mcpCount > 3) {
    sentences.push(
      `${mcpCount} MCP servers connected — that's serious tool integration.`
    );
  }

  // Pioneer mention
  if (score.pioneer.isPioneer) {
    sentences.push(
      "Pioneer badge earned — you're building what the taxonomy hasn't seen yet."
    );
  }

  return sentences.join(" ");
}
