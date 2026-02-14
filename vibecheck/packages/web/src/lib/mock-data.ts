import type { Detection, ScoreResult, ProbeResult } from "./types";
import { computeScore } from "./scoring";

// Realistic mock detections for a "Gary-like" Level 67 Architect setup
export const MOCK_DETECTIONS: Detection[] = [
  // Intelligence (models & providers)
  {
    id: "anthropic-api-key",
    category: "intelligence",
    name: "Anthropic API Key",
    source: "~/.zshrc",
    confidence: "high",
    tier: "advanced",
    taxonomyMatch: "anthropic",
  },
  {
    id: "openai-api-key",
    category: "intelligence",
    name: "OpenAI API Key",
    source: "~/.zshrc",
    confidence: "high",
    tier: "intermediate",
    taxonomyMatch: "openai",
  },
  {
    id: "google-api-key",
    category: "intelligence",
    name: "Google Gemini API Key",
    source: "~/.zshrc",
    confidence: "high",
    tier: "intermediate",
    taxonomyMatch: "google",
  },
  {
    id: "model-routing-aliases",
    category: "intelligence",
    name: "Model routing aliases",
    source: "~/.zshrc",
    confidence: "medium",
    tier: "advanced",
    taxonomyMatch: "model-routing",
    details: { aliases: ["think", "quick", "gemini-search"] },
  },

  // Tooling (CLI tools, MCP servers, IDE)
  {
    id: "claude-code-cli",
    category: "tooling",
    name: "Claude Code CLI",
    source: "which claude",
    confidence: "high",
    tier: "advanced",
    taxonomyMatch: "claude-code",
  },
  {
    id: "cursor-ide",
    category: "tooling",
    name: "Cursor IDE",
    source: "which cursor",
    confidence: "high",
    tier: "intermediate",
    taxonomyMatch: "cursor",
  },
  {
    id: "mcp-filesystem",
    category: "tooling",
    name: "MCP: Filesystem",
    source: "~/.claude/settings.json",
    confidence: "high",
    tier: "intermediate",
    taxonomyMatch: "mcp-filesystem",
  },
  {
    id: "mcp-github",
    category: "tooling",
    name: "MCP: GitHub",
    source: "~/.claude/settings.json",
    confidence: "high",
    tier: "intermediate",
    taxonomyMatch: "mcp-github",
  },
  {
    id: "mcp-obsidian",
    category: "tooling",
    name: "MCP: Obsidian",
    source: "~/.claude/settings.json",
    confidence: "high",
    tier: "intermediate",
    taxonomyMatch: "mcp-obsidian",
  },
  {
    id: "mcp-supabase",
    category: "tooling",
    name: "MCP: Supabase",
    source: "~/.claude/settings.json",
    confidence: "high",
    tier: "advanced",
    taxonomyMatch: "mcp-supabase",
  },
  {
    id: "mcp-google-drive",
    category: "tooling",
    name: "MCP: Google Drive",
    source: "~/.claude/settings.json",
    confidence: "high",
    tier: "intermediate",
    taxonomyMatch: "mcp-google-drive",
  },
  {
    id: "mcp-brave-search",
    category: "tooling",
    name: "MCP: Brave Search",
    source: "~/.claude/settings.json",
    confidence: "high",
    tier: "intermediate",
    taxonomyMatch: "mcp-brave-search",
  },
  {
    id: "mcp-voicemode",
    category: "tooling",
    name: "MCP: Voice Mode",
    source: "~/.claude/settings.json",
    confidence: "high",
    tier: "advanced",
    taxonomyMatch: null, // Innovation: custom voice MCP
    details: { type: "custom" },
  },

  // Continuity (memory, CLAUDE.md, context)
  {
    id: "claude-md-detailed",
    category: "continuity",
    name: "Detailed CLAUDE.md",
    source: "~/project/CLAUDE.md",
    confidence: "high",
    tier: "advanced",
    taxonomyMatch: "claude-md",
    details: { lineCount: 120, sections: ["overview", "architecture", "testing", "style"] },
  },
  {
    id: "claude-memories",
    category: "continuity",
    name: "Claude Code memories",
    source: "~/.claude/memories/",
    confidence: "high",
    tier: "intermediate",
    taxonomyMatch: "claude-memories",
  },
  {
    id: "split-rules",
    category: "continuity",
    name: "Split rules directory",
    source: ".claude/rules/",
    confidence: "medium",
    tier: "advanced",
    taxonomyMatch: "split-rules",
  },

  // Autonomy (agents, subagents, orchestration)
  {
    id: "claude-subagents",
    category: "autonomy",
    name: "Claude Code subagents",
    source: ".claude/agents/",
    confidence: "high",
    tier: "advanced",
    taxonomyMatch: "subagents",
  },
  {
    id: "claude-hooks",
    category: "autonomy",
    name: "Claude Code hooks",
    source: ".claude/settings.json",
    confidence: "high",
    tier: "advanced",
    taxonomyMatch: "hooks",
  },
  {
    id: "tmux-config",
    category: "autonomy",
    name: "tmux configuration",
    source: "~/.tmux.conf",
    confidence: "medium",
    tier: "intermediate",
    taxonomyMatch: "tmux",
  },

  // Ship (CI/CD, testing, deploy)
  {
    id: "vercel-config",
    category: "ship",
    name: "Vercel deployment",
    source: "vercel.json",
    confidence: "high",
    tier: "intermediate",
    taxonomyMatch: "vercel",
  },
  {
    id: "netlify-config",
    category: "ship",
    name: "Netlify deployment",
    source: "netlify.toml",
    confidence: "high",
    tier: "intermediate",
    taxonomyMatch: "netlify",
  },
  {
    id: "github-actions",
    category: "ship",
    name: "GitHub Actions CI",
    source: ".github/workflows/",
    confidence: "high",
    tier: "advanced",
    taxonomyMatch: "github-actions",
  },
  {
    id: "test-config",
    category: "ship",
    name: "Test framework (Vitest)",
    source: "vitest.config.ts",
    confidence: "high",
    tier: "intermediate",
    taxonomyMatch: "vitest",
  },

  // Security
  {
    id: "gitignore-env",
    category: "security",
    name: ".gitignore covers .env",
    source: ".gitignore",
    confidence: "high",
    tier: "basic",
    taxonomyMatch: "gitignore-env",
  },
  {
    id: "env-vars",
    category: "security",
    name: "Environment variable secrets",
    source: "~/.zshrc",
    confidence: "high",
    tier: "intermediate",
    taxonomyMatch: "env-vars",
  },
  {
    id: "agent-permissions",
    category: "security",
    name: "Agent permission scoping",
    source: ".claude/settings.json",
    confidence: "medium",
    tier: "advanced",
    taxonomyMatch: "agent-permissions",
  },

  // Ops
  {
    id: "task-tracking",
    category: "ops",
    name: "Task tracking in CLAUDE.md",
    source: "CLAUDE.md",
    confidence: "medium",
    tier: "intermediate",
    taxonomyMatch: "task-tracking",
  },
  {
    id: "npm-scripts",
    category: "ops",
    name: "Build/dev/lint scripts",
    source: "package.json",
    confidence: "high",
    tier: "basic",
    taxonomyMatch: "npm-scripts",
  },

  // Social
  {
    id: "github-public-repos",
    category: "social",
    name: "Public GitHub repositories",
    source: "github.com",
    confidence: "medium",
    tier: "intermediate",
    taxonomyMatch: "github-repos",
  },
];

export const MOCK_SCORE: ScoreResult = computeScore(MOCK_DETECTIONS);

// Full ProbeResult for the /result/demo page
export const MOCK_RESULT: ProbeResult = {
  version: "0.3.0",
  timestamp: "2026-02-14T00:00:00.000Z",
  platform: "darwin",
  detections: MOCK_DETECTIONS,
  score: MOCK_SCORE,
};

// A simpler "Observer" level mock for testing lower tiers
export const MOCK_OBSERVER_DETECTIONS: Detection[] = [
  {
    id: "openai-api-key",
    category: "intelligence",
    name: "OpenAI API Key",
    source: "~/.zshrc",
    confidence: "high",
    tier: "basic",
    taxonomyMatch: "openai",
  },
];

export const MOCK_OBSERVER_SCORE: ScoreResult = computeScore(MOCK_OBSERVER_DETECTIONS);
