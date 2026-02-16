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
  const sentences: string[] = [];

  // MCP servers — extract server names from detection IDs
  const mcpDetections = detections.filter((d) => d.id.startsWith("mcp-"));
  if (mcpDetections.length > 0) {
    const serverNames = mcpDetections.map((d) => d.id.replace(/^mcp-/, ""));
    const maxShow = 3;
    const shown = serverNames.slice(0, maxShow).join(", ");
    const more = serverNames.length > maxShow ? ` and ${serverNames.length - maxShow} more` : "";
    sentences.push(`Running ${mcpDetections.length} MCP server${mcpDetections.length === 1 ? "" : "s"} including ${shown}${more}.`);
  }

  // Named tools (custom skills, agents, commands)
  const namedDetections = detections.filter(
    (d) => d.details?.names && Array.isArray(d.details.names) && (d.details.names as string[]).length > 0
  );
  const totalNames = namedDetections.reduce(
    (sum, d) => sum + (d.details!.names as string[]).length, 0
  );
  if (totalNames > 0) {
    const allNames = namedDetections.flatMap((d) => d.details!.names as string[]);
    const maxShow = 3;
    const shown = allNames.slice(0, maxShow).join(", ");
    const more = allNames.length > maxShow ? ` +${allNames.length - maxShow} more` : "";
    sentences.push(`${totalNames} custom tool${totalNames === 1 ? "" : "s"} built (${shown}${more}).`);
  }

  // Pattern bonuses
  const patterns = detections.filter((d) => d.id.startsWith("pattern:"));
  if (patterns.length > 0) {
    const patternNames = [...new Set(patterns.map((d) => d.name))];
    sentences.push(`${patternNames.length} workflow pattern${patternNames.length === 1 ? "" : "s"} detected.`);
  }

  // Weakest category as growth area
  const weakCandidates = [...score.categories]
    .filter((c) => c.score < 50)
    .sort((a, b) => a.score - b.score);
  if (weakCandidates.length > 0) {
    sentences.push(
      `${CATEGORY_LABELS[weakCandidates[0].category]} is your biggest growth area.`
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
