import type { TierTitle } from "@vibe/scoring";

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

// -- Archetype names mapped to 4-letter codes --

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
  MARD: "Deep model expertise, autonomous agents, rigorous shipping, and a deep tool ecosystem. You run a symphony of AI tools.",
  MARC: "Strategic model selection with autonomous agents, but shipping is measured and deliberate. You build carefully and deploy with confidence.",
  MARL: "Smart model strategy with autonomous agents and rapid shipping, but a lighter tool footprint. Speed is the priority.",
  MACD: "Master strategist with autonomous agents and deep tooling, but cautious on shipping. You perfect before you deploy.",
  MACL: "Strategic thinker with autonomous agents in a lean setup. Quality over quantity, brains over brawn.",
  MGRD: "Model expertise paired with guided agents and rigorous process. You trust the AI, but you steer the ship.",
  MGRL: "Smart model use, guided agents, and rapid shipping with a lean stack. Efficient and effective.",
  MGCD: "Deep model knowledge, guided agents, cautious shipping, deep tools. The fortress — nothing gets past you.",
  MGCL: "Thoughtful model strategy in a guided, lean setup. The scholar — methodical and measured.",
  VARD: "Velocity-first with autonomous agents, rapid shipping, and deep tooling. An unstoppable force.",
  VARL: "Speed plus autonomy plus rapid shipping. Light on tools but heavy on output. The maverick.",
  VACD: "Velocity seeker with autonomous agents, cautious shipping, and deep tools. Tries everything, ships the best.",
  VACL: "Fast, autonomous, cautious, light. The freelancer — moves fast but picks battles carefully.",
  VGRD: "Velocity is the vibe. Ships fast, integrates everything, but keeps the AI on a leash.",
  VGRL: "Fast, guided, rapid, light. The scrapper — does more with less and ships it yesterday.",
  VGCD: "Velocity seeker who tinkers with deep tools under guided supervision. Always on the bleeding edge.",
  VGCL: "The explorer — fast-moving, guided, cautious, and light. Just getting started on the journey, but moving quick.",
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
