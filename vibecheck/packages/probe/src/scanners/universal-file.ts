import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { homedir } from "node:os";
import type { Detection, ScanResult, TaxonomyCategory, DetectionTier } from "../types.js";
import type { Scanner } from "./index.js";
import { classify, type RawFinding } from "../taxonomy/classifier.js";
import { fileExists, readFileIfExists, readJsonIfExists, shellOutput, expandHome } from "./utils.js";
import { discoverWorkspaces, isMonorepo } from "./workspace.js";

// ---------------------------------------------------------------------------
// Check types
// ---------------------------------------------------------------------------
type CheckType =
  | "exists"
  | "lineCount"
  | "dirChildren"
  | "grepKeywords"
  | "jsonField"
  | "shell"
  | "testRatio"
  | "filePermission";

type Scope = "project" | "workspace" | "global";

interface UFSCheck {
  id: string;
  artifact: string;        // relative path to check (or shell command for "shell")
  category: TaxonomyCategory;
  tier: DetectionTier;
  points: number;
  signal: string;
  check: CheckType;
  threshold?: number;
  keywords?: string[];
  jsonPath?: string;
  scope: Scope[];
  dependsOn?: string;      // only run if this artifact exists
  supersedes?: string;      // v2 detection ID this replaces
}

// Multi-category emission: some checks award points in multiple categories
interface MultiEmission {
  category: TaxonomyCategory;
  tier: DetectionTier;
  points: number;
  id: string;
  signal: string;
}

interface UFSCheckMulti extends Omit<UFSCheck, "category" | "tier" | "points" | "signal" | "id"> {
  emissions: MultiEmission[];
  check: CheckType;
  scope: Scope[];
  artifact: string;
  dependsOn?: string;
  supersedes?: string;
}

type ConfigEntry = UFSCheck | UFSCheckMulti;

function isMulti(c: ConfigEntry): c is UFSCheckMulti {
  return "emissions" in c;
}

// ---------------------------------------------------------------------------
// Detection config — ~45 checks encoding the spec section 2.1
// Ordered highest-threshold-first per artifact for conditional-chain dedup
// ---------------------------------------------------------------------------
const CHECKS: ConfigEntry[] = [
  // ── AI Tool Customization ──────────────────────────────────────────────

  // CLAUDE.md L3: >100 lines + architecture/security/memory keywords
  {
    emissions: [
      { id: "ufs:claude-md:deep", category: "tooling", tier: "advanced", points: 15, signal: "CLAUDE.md >100 lines with architecture keywords" },
      { id: "ufs:claude-md:deep:continuity", category: "continuity", tier: "advanced", points: 10, signal: "CLAUDE.md deep continuity context" },
      { id: "ufs:claude-md:deep:autonomy", category: "autonomy", tier: "basic", points: 5, signal: "CLAUDE.md autonomy guidance" },
    ],
    artifact: "CLAUDE.md",
    check: "grepKeywords",
    threshold: 100,
    keywords: ["architecture", "security", "memory", "convention", "principle", "constraint", "pattern", "workflow"],
    scope: ["project"],
    supersedes: "claude-md",
  },
  // CLAUDE.md L2: >50 lines
  {
    emissions: [
      { id: "ufs:claude-md:rich", category: "tooling", tier: "intermediate", points: 8, signal: "CLAUDE.md >50 lines" },
      { id: "ufs:claude-md:rich:continuity", category: "continuity", tier: "basic", points: 5, signal: "CLAUDE.md continuity context" },
    ],
    artifact: "CLAUDE.md",
    check: "lineCount",
    threshold: 50,
    scope: ["project"],
    supersedes: "claude-md",
  },
  // CLAUDE.md L1: exists
  { id: "ufs:claude-md:exists", artifact: "CLAUDE.md", category: "tooling", tier: "basic", points: 3, signal: "CLAUDE.md exists", check: "exists", scope: ["project"], supersedes: "claude-md" },

  // .claude/ directory
  {
    emissions: [
      { id: "ufs:claude-dir:advanced", category: "tooling", tier: "advanced", points: 15, signal: ".claude/ with agents/skills/rules/hooks" },
      { id: "ufs:claude-dir:advanced:autonomy", category: "autonomy", tier: "basic", points: 5, signal: ".claude/ autonomy features" },
    ],
    artifact: ".claude/",
    check: "grepKeywords",
    keywords: ["agents", "skills", "rules", "hooks"],
    scope: ["project"],
  },
  // .claude/settings.json non-default
  { id: "ufs:claude-settings:custom", artifact: ".claude/settings.json", category: "tooling", tier: "basic", points: 5, signal: ".claude/settings.json non-default", check: "lineCount", threshold: 3, scope: ["project"] },
  // .claude/ exists
  { id: "ufs:claude-dir:exists", artifact: ".claude/", category: "tooling", tier: "basic", points: 3, signal: ".claude/ directory exists", check: "exists", scope: ["project"] },

  // .cursorrules
  { id: "ufs:cursorrules:rich", artifact: ".cursorrules", category: "tooling", tier: "intermediate", points: 8, signal: ".cursorrules >30 lines", check: "lineCount", threshold: 30, scope: ["project"], supersedes: "cursorrules" },
  {
    emissions: [
      { id: "ufs:cursorrules:rich:continuity", category: "continuity", tier: "basic", points: 5, signal: ".cursorrules continuity" },
    ],
    artifact: ".cursorrules",
    check: "lineCount",
    threshold: 30,
    scope: ["project"],
  },
  { id: "ufs:cursorrules:exists", artifact: ".cursorrules", category: "tooling", tier: "basic", points: 3, signal: ".cursorrules exists", check: "exists", scope: ["project"], supersedes: "cursorrules" },

  // .cursor/ with rules
  { id: "ufs:cursor-dir:rules", artifact: ".cursor/rules", category: "tooling", tier: "intermediate", points: 8, signal: ".cursor/ with rules", check: "exists", scope: ["project"] },

  // .github/copilot-instructions.md
  { id: "ufs:copilot-instructions:rich", artifact: ".github/copilot-instructions.md", category: "tooling", tier: "intermediate", points: 8, signal: "Copilot instructions >20 lines", check: "lineCount", threshold: 20, scope: ["project"], supersedes: "copilot-instructions" },
  { id: "ufs:copilot-instructions:exists", artifact: ".github/copilot-instructions.md", category: "tooling", tier: "basic", points: 3, signal: "Copilot instructions exist", check: "exists", scope: ["project"], supersedes: "copilot-instructions" },

  // AGENTS.md
  {
    emissions: [
      { id: "ufs:agents-md:deep", category: "continuity", tier: "advanced", points: 15, signal: "AGENTS.md >50 lines with behavioral keywords" },
      { id: "ufs:agents-md:deep:autonomy", category: "autonomy", tier: "intermediate", points: 10, signal: "AGENTS.md autonomy coordination" },
    ],
    artifact: "AGENTS.md",
    check: "grepKeywords",
    threshold: 50,
    keywords: ["behavioral", "coordinate", "delegate", "autonomous", "agent", "role", "responsibility"],
    scope: ["project"],
    supersedes: "agents-md",
  },
  { id: "ufs:agents-md:exists", artifact: "AGENTS.md", category: "tooling", tier: "basic", points: 3, signal: "AGENTS.md exists", check: "exists", scope: ["project"], supersedes: "agents-md" },

  // SOUL.md
  {
    emissions: [
      { id: "ufs:soul-md:rich", category: "continuity", tier: "intermediate", points: 10, signal: "SOUL.md >20 lines" },
      { id: "ufs:soul-md:rich:intelligence", category: "intelligence", tier: "basic", points: 5, signal: "SOUL.md intelligence spec" },
    ],
    artifact: "SOUL.md",
    check: "lineCount",
    threshold: 20,
    scope: ["project"],
    supersedes: "soul-md",
  },
  { id: "ufs:soul-md:exists", artifact: "SOUL.md", category: "continuity", tier: "basic", points: 5, signal: "SOUL.md exists", check: "exists", scope: ["project"], supersedes: "soul-md" },

  // USER.md
  { id: "ufs:user-md:exists", artifact: "USER.md", category: "continuity", tier: "basic", points: 3, signal: "USER.md exists", check: "exists", scope: ["project"] },

  // .mcp.json
  { id: "ufs:mcp-json:many", artifact: ".mcp.json", category: "tooling", tier: "advanced", points: 15, signal: ".mcp.json >6 servers", check: "jsonField", jsonPath: "mcpServers", threshold: 6, scope: ["project"] },
  { id: "ufs:mcp-json:several", artifact: ".mcp.json", category: "tooling", tier: "intermediate", points: 10, signal: ".mcp.json >3 servers", check: "jsonField", jsonPath: "mcpServers", threshold: 3, scope: ["project"] },
  { id: "ufs:mcp-json:exists", artifact: ".mcp.json", category: "tooling", tier: "basic", points: 5, signal: ".mcp.json exists", check: "exists", scope: ["project"] },

  // MCP SDK in package.json → Pioneer
  { id: "ufs:mcp-sdk:pioneer", artifact: "package.json", category: "tooling", tier: "elite", points: 20, signal: "@modelcontextprotocol/sdk in package.json", check: "grepKeywords", keywords: ["@modelcontextprotocol/sdk"], scope: ["project"] },

  // ── Memory & Persistence ───────────────────────────────────────────────

  // memory/ with heartbeat-state.json
  { id: "ufs:memory-dir:heartbeat", artifact: "memory/heartbeat-state.json", category: "autonomy", tier: "basic", points: 5, signal: "memory/ heartbeat state", check: "exists", scope: ["project"] },
  // memory/ with active-work.md
  { id: "ufs:memory-dir:active", artifact: "memory/active-work.md", category: "continuity", tier: "basic", points: 5, signal: "memory/ active work", check: "exists", scope: ["project"] },
  // memory/ >5 dated files
  { id: "ufs:memory-dir:rich", artifact: "memory/", category: "continuity", tier: "intermediate", points: 10, signal: "memory/ >5 dated files", check: "dirChildren", threshold: 5, scope: ["project"] },
  // memory/ exists
  { id: "ufs:memory-dir:exists", artifact: "memory/", category: "continuity", tier: "basic", points: 5, signal: "memory/ directory", check: "exists", scope: ["project"] },

  // MEMORY.md
  { id: "ufs:memory-md:rich", artifact: "MEMORY.md", category: "continuity", tier: "intermediate", points: 10, signal: "MEMORY.md >50 lines", check: "lineCount", threshold: 50, scope: ["project"], supersedes: "memory-md" },
  { id: "ufs:memory-md:exists", artifact: "MEMORY.md", category: "continuity", tier: "basic", points: 5, signal: "MEMORY.md exists", check: "exists", scope: ["project"], supersedes: "memory-md" },

  // HEARTBEAT.md
  { id: "ufs:heartbeat-md:exists", artifact: "HEARTBEAT.md", category: "autonomy", tier: "basic", points: 5, signal: "HEARTBEAT.md exists", check: "exists", scope: ["project"], supersedes: "heartbeat" },

  // EVOLVE.md
  { id: "ufs:evolve-md:exists", artifact: "EVOLVE.md", category: "continuity", tier: "basic", points: 5, signal: "EVOLVE.md exists", check: "exists", scope: ["project"], supersedes: "evolve-md" },

  // Handoff/session files
  { id: "ufs:handoff:exists", artifact: "handoff", category: "continuity", tier: "basic", points: 5, signal: "Handoff/session state files", check: "exists", scope: ["project"] },

  // ── Project Structure ──────────────────────────────────────────────────

  // specs/ with files
  { id: "ufs:specs-dir:exists", artifact: "specs/", category: "ops", tier: "intermediate", points: 10, signal: "specs/ directory with files", check: "dirChildren", threshold: 0, scope: ["project"] },

  // docs/PRD*.md
  { id: "ufs:prd:exists", artifact: "docs/", category: "ops", tier: "intermediate", points: 10, signal: "PRD document", check: "grepKeywords", keywords: ["PRD"], scope: ["project"] },

  // Test ratio
  { id: "ufs:test-ratio:high", artifact: ".", category: "ship", tier: "advanced", points: 15, signal: "Test ratio >0.3", check: "testRatio", threshold: 0.3, scope: ["project"] },
  { id: "ufs:test-ratio:medium", artifact: ".", category: "ship", tier: "intermediate", points: 8, signal: "Test ratio >0.1", check: "testRatio", threshold: 0.1, scope: ["project"] },
  { id: "ufs:test-ratio:zero", artifact: ".", category: "ship", tier: "basic", points: -5, signal: "No tests with >5 source files", check: "testRatio", threshold: -1, scope: ["project"] },

  // .env.example
  { id: "ufs:env-example:exists", artifact: ".env.example", category: "social", tier: "basic", points: 5, signal: ".env.example exists", check: "exists", scope: ["project"] },

  // README.md badges
  { id: "ufs:readme:badges", artifact: "README.md", category: "ops", tier: "basic", points: 3, signal: "README.md with badges", check: "grepKeywords", keywords: ["![", "badge", "shield"], scope: ["project"] },
  // README.md rich (>100 lines, >3 headers)
  { id: "ufs:readme:rich", artifact: "README.md", category: "ops", tier: "intermediate", points: 8, signal: "README.md >100 lines with >3 headers", check: "lineCount", threshold: 100, scope: ["project"], supersedes: "documentation" },
  // README.md exists
  { id: "ufs:readme:exists", artifact: "README.md", category: "ops", tier: "basic", points: 3, signal: "README.md exists", check: "exists", scope: ["project"], supersedes: "documentation" },

  // .github/workflows
  { id: "ufs:ci:complex", artifact: ".github/workflows/", category: "ship", tier: "intermediate", points: 10, signal: "2+ CI workflow files", check: "dirChildren", threshold: 1, scope: ["project"], supersedes: "github-actions" },
  { id: "ufs:ci:exists", artifact: ".github/workflows/", category: "ship", tier: "basic", points: 5, signal: "CI workflow exists", check: "dirChildren", threshold: 0, scope: ["project"], supersedes: "github-actions" },

  // Docker
  { id: "ufs:docker:exists", artifact: "Dockerfile", category: "ship", tier: "basic", points: 5, signal: "Dockerfile exists", check: "exists", scope: ["project"], supersedes: "docker" },
  { id: "ufs:docker-compose:exists", artifact: "docker-compose.yml", category: "ship", tier: "basic", points: 5, signal: "docker-compose.yml exists", check: "exists", scope: ["project"] },

  // Monorepo tools
  { id: "ufs:turbo:exists", artifact: "turbo.json", category: "ops", tier: "basic", points: 5, signal: "Turborepo config", check: "exists", scope: ["project"], supersedes: "turbo" },
  { id: "ufs:nx:exists", artifact: "nx.json", category: "ops", tier: "basic", points: 5, signal: "Nx config", check: "exists", scope: ["project"], supersedes: "nx" },

  // CODEOWNERS
  { id: "ufs:codeowners:exists", artifact: ".github/CODEOWNERS", category: "social", tier: "basic", points: 5, signal: "CODEOWNERS file", check: "exists", scope: ["project"] },

  // PR template
  { id: "ufs:pr-template:exists", artifact: ".github/PULL_REQUEST_TEMPLATE.md", category: "social", tier: "basic", points: 3, signal: "PR template", check: "exists", scope: ["project"] },

  // CHANGELOG
  { id: "ufs:changelog:exists", artifact: "CHANGELOG.md", category: "ops", tier: "basic", points: 5, signal: "CHANGELOG.md exists", check: "exists", scope: ["project"] },

  // Husky / git hooks
  { id: "ufs:husky:exists", artifact: ".husky/", category: "ops", tier: "basic", points: 5, signal: "Husky git hooks", check: "exists", scope: ["project"] },

  // LICENSE
  { id: "ufs:license:exists", artifact: "LICENSE", category: "social", tier: "basic", points: 3, signal: "LICENSE file", check: "exists", scope: ["project"] },

  // ── Agent Infrastructure (OpenClaw / Power-User) ──────────────────────

  { id: "ufs:openclaw-skills:many", artifact: "skills/", category: "autonomy", tier: "elite", points: 20, signal: "skills/ >9 entries", check: "dirChildren", threshold: 9, scope: ["project"] },
  { id: "ufs:openclaw-skills:some", artifact: "skills/", category: "autonomy", tier: "advanced", points: 10, signal: "skills/ >2 entries", check: "dirChildren", threshold: 2, scope: ["project"] },
  { id: "ufs:sops-dir:exists", artifact: "sops/", category: "ops", tier: "intermediate", points: 10, signal: "sops/ directory", check: "exists", scope: ["project"] },
  { id: "ufs:kanban:exists", artifact: "kanban/", category: "ops", tier: "advanced", points: 15, signal: "kanban/ directory", check: "exists", scope: ["project"] },
  { id: "ufs:identity-md:exists", artifact: "IDENTITY.md", category: "continuity", tier: "intermediate", points: 8, signal: "IDENTITY.md exists", check: "exists", scope: ["project"] },
  { id: "ufs:tools-md:rich", artifact: "TOOLS.md", category: "tooling", tier: "intermediate", points: 8, signal: "TOOLS.md >30 lines", check: "lineCount", threshold: 30, scope: ["project"] },
  { id: "ufs:tools-md:exists", artifact: "TOOLS.md", category: "tooling", tier: "basic", points: 3, signal: "TOOLS.md exists", check: "exists", scope: ["project"] },
  { id: "ufs:obsidian-vault:exists", artifact: "obsidian-vault/", category: "continuity", tier: "advanced", points: 15, signal: "obsidian-vault/ directory", check: "exists", scope: ["project"] },
  { id: "ufs:scripts-dir:many", artifact: "scripts/", category: "ops", tier: "intermediate", points: 10, signal: "scripts/ >4 entries", check: "dirChildren", threshold: 4, scope: ["project"] },
  { id: "ufs:avatars:exists", artifact: "avatars/", category: "social", tier: "basic", points: 3, signal: "avatars/ directory", check: "exists", scope: ["project"] },

  // ── Pattern Bonuses ──────────────────────────────────────────────────

  {
    emissions: [
      { id: "pattern:learning-loop", category: "continuity", tier: "elite", points: 20, signal: "Learning Loop (MEMORY.md + memory/)" },
      { id: "pattern:learning-loop:ops", category: "ops", tier: "advanced", points: 10, signal: "Learning Loop ops maturity" },
    ],
    artifact: "MEMORY.md",
    check: "grepKeywords",
    keywords: ["daily", "curated", "active-work", "lesson"],
    threshold: 50,
    dependsOn: "memory/",
    scope: ["project"],
  },
  {
    emissions: [
      { id: "pattern:distributed-rig", category: "autonomy", tier: "elite", points: 20, signal: "Distributed Rig (TOOLS.md + skills/)" },
      { id: "pattern:distributed-rig:ops", category: "ops", tier: "advanced", points: 10, signal: "Distributed Rig ops maturity" },
    ],
    artifact: "TOOLS.md",
    check: "grepKeywords",
    keywords: ["tailscale", "ssh", "mac mini", "VPN", "remote", "machine"],
    dependsOn: "skills/",
    scope: ["project"],
  },
  {
    emissions: [
      { id: "pattern:full-agent-stack", category: "autonomy", tier: "elite", points: 25, signal: "Full Agent Stack (AGENTS.md + SOUL.md)" },
      { id: "pattern:full-agent-stack:continuity", category: "continuity", tier: "elite", points: 15, signal: "Full Agent Stack continuity" },
    ],
    artifact: "AGENTS.md",
    check: "exists",
    dependsOn: "SOUL.md",
    scope: ["project"],
  },

  // ── Security ───────────────────────────────────────────────────────────

  // Canary keywords in agent config
  { id: "ufs:security:canary", artifact: "CLAUDE.md", category: "security", tier: "basic", points: 5, signal: "Canary keyword in agent config", check: "grepKeywords", keywords: ["canary", "honeypot", "tripwire"], scope: ["project"], supersedes: "canary-tokens" },

  // Injection defense keywords
  { id: "ufs:security:injection", artifact: "CLAUDE.md", category: "security", tier: "basic", points: 5, signal: "Injection defense keywords", check: "grepKeywords", keywords: ["injection", "defense", "safety boundary"], scope: ["project"], supersedes: "prompt-injection-defense" },

  // "require confirmation" / "ask first"
  { id: "ufs:security:confirm", artifact: "CLAUDE.md", category: "security", tier: "basic", points: 5, signal: "Confirmation requirement in config", check: "grepKeywords", keywords: ["require confirmation", "ask first", "ask before", "confirm before"], scope: ["project"] },

  // .gitignore with secret patterns
  { id: "ufs:security:gitignore", artifact: ".gitignore", category: "security", tier: "basic", points: 3, signal: ".gitignore covers secrets", check: "grepKeywords", keywords: [".env", "secret", "credential", ".pem", "key"], scope: ["project"], supersedes: "gitignore-env" },

  // ── Environment (deep-only shell checks) ───────────────────────────────

  // Crontab AI entries
  { id: "ufs:cron:ai", artifact: "crontab -l", category: "autonomy", tier: "basic", points: 5, signal: "AI crontab entries", check: "shell", scope: ["global"] },

  // launchd AI services
  { id: "ufs:launchd:ai", artifact: "launchctl list", category: "autonomy", tier: "basic", points: 5, signal: "AI launchd services", check: "shell", scope: ["global"] },
];

// ---------------------------------------------------------------------------
// Check functions
// ---------------------------------------------------------------------------

async function checkExists(basePath: string, artifact: string): Promise<boolean> {
  const full = join(basePath, artifact);
  return fileExists(full);
}

async function checkLineCount(basePath: string, artifact: string, threshold: number): Promise<boolean> {
  const content = await readFileIfExists(join(basePath, artifact));
  if (!content) return false;
  return content.split("\n").length > threshold;
}

async function checkDirChildren(basePath: string, artifact: string, threshold: number): Promise<{ pass: boolean; count: number }> {
  try {
    const entries = await readdir(join(basePath, artifact));
    return { pass: entries.length > threshold, count: entries.length };
  } catch {
    return { pass: false, count: 0 };
  }
}

async function checkGrepKeywords(
  basePath: string,
  artifact: string,
  keywords: string[],
  threshold?: number,
): Promise<boolean> {
  // For directories, check if any subdirectory name matches a keyword
  if (artifact.endsWith("/")) {
    try {
      const entries = await readdir(join(basePath, artifact));
      const lowerEntries = entries.map(e => e.toLowerCase());
      return keywords.some(k => lowerEntries.some(e => e.includes(k.toLowerCase())));
    } catch {
      return false;
    }
  }

  // For "docs/" artifact checking for PRD filenames
  if (artifact === "docs/") {
    try {
      const entries = await readdir(join(basePath, "docs"));
      return entries.some(e => keywords.some(k => e.toUpperCase().includes(k.toUpperCase())));
    } catch {
      return false;
    }
  }

  const content = await readFileIfExists(join(basePath, artifact));
  if (!content) return false;

  // If threshold specified, also enforce line count
  if (threshold !== undefined) {
    if (content.split("\n").length <= threshold) return false;
  }

  const lower = content.toLowerCase();
  return keywords.some(k => lower.includes(k.toLowerCase()));
}

async function checkJsonField(basePath: string, artifact: string, jsonPath: string, threshold: number): Promise<boolean> {
  const data = await readJsonIfExists<Record<string, unknown>>(join(basePath, artifact));
  if (!data) return false;
  const field = data[jsonPath];
  if (!field || typeof field !== "object") return false;
  return Object.keys(field).length > threshold;
}

async function checkTestRatio(basePath: string, threshold: number): Promise<{ pass: boolean; ratio: number; srcCount: number; testCount: number }> {
  const srcExts = [".ts", ".js", ".py", ".go", ".rs"];
  const srcDirs = ["src", "app", "lib"];
  const testPatterns = [/\.test\./, /\.spec\./, /__tests__/, /test_/, /_test\./];

  let srcCount = 0;
  let testCount = 0;

  async function walkDir(dir: string, depth = 0): Promise<void> {
    if (depth > 4) return;
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist" || entry.name === "build") continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          await walkDir(full, depth + 1);
        } else if (srcExts.some(ext => entry.name.endsWith(ext))) {
          if (testPatterns.some(p => p.test(entry.name))) {
            testCount++;
          } else {
            srcCount++;
          }
        }
      }
    } catch { /* not readable */ }
  }

  for (const d of srcDirs) {
    await walkDir(join(basePath, d));
  }

  // threshold = -1 means "test ratio is zero AND >5 source files" (penalty check)
  if (threshold === -1) {
    return { pass: srcCount > 5 && testCount === 0, ratio: 0, srcCount, testCount };
  }

  if (srcCount === 0) return { pass: false, ratio: 0, srcCount, testCount };
  const ratio = testCount / srcCount;
  return { pass: ratio > threshold, ratio, srcCount, testCount };
}

async function checkShell(artifact: string, keywords: string[]): Promise<boolean> {
  const output = await shellOutput(artifact);
  if (!output) return false;
  const lower = output.toLowerCase();
  const aiKeywords = ["claude", "codex", "cursor", "gemini", "ollama", "openai", "anthropic", "aider"];
  return aiKeywords.some(k => lower.includes(k));
}

async function checkFilePermission(basePath: string, artifact: string): Promise<boolean> {
  try {
    const s = await stat(join(basePath, artifact));
    const perms = s.mode & 0o777;
    return perms <= 0o600;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Handoff file detection (glob-like: handoff*, handover*, session-state*)
// ---------------------------------------------------------------------------
async function findHandoffFiles(basePath: string): Promise<boolean> {
  try {
    const entries = await readdir(basePath);
    return entries.some(e => {
      const lower = e.toLowerCase();
      return lower.startsWith("handoff") || lower.startsWith("handover") || lower.startsWith("session-state");
    });
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Scanner class
// ---------------------------------------------------------------------------
export class UniversalFileScanner implements Scanner {
  name = "universal-file";

  constructor(private deep: boolean = false) {}

  async scan(): Promise<ScanResult> {
    const start = performance.now();
    const cwd = process.cwd();
    const home = homedir();
    const detections: Detection[] = [];

    // 1. Discover workspaces
    const workspaces = await discoverWorkspaces(cwd);

    // 2. Build scope→path map
    const scopePaths: Record<Scope, string[]> = {
      project: [cwd],
      workspace: workspaces,
      global: [home],
    };

    // Conditional chain dedup: only emit highest match per (artifact, category)
    const emittedArtifactCategory = new Set<string>();

    // 3. Process each config entry
    for (const entry of CHECKS) {
      const scopes = isMulti(entry) ? entry.scope : entry.scope;
      const artifact = isMulti(entry) ? entry.artifact : entry.artifact;

      for (const scope of scopes) {
        // Skip global unless deep
        if (scope === "global" && !this.deep) continue;

        const paths = scopePaths[scope];
        for (const basePath of paths) {
          // Special: handoff files use glob-like matching
          if (artifact === "handoff") {
            if (await findHandoffFiles(basePath)) {
              const scopeLabel = scope === "project" ? "" : ` [${scope}]`;
              const id = isMulti(entry) ? entry.emissions[0].id : entry.id;
              const category = isMulti(entry) ? entry.emissions[0].category : entry.category;
              const tier = isMulti(entry) ? entry.emissions[0].tier : entry.tier;
              const points = isMulti(entry) ? entry.emissions[0].points : entry.points;
              const signal = isMulti(entry) ? entry.emissions[0].signal : entry.signal;

              const key = `${artifact}:${category}`;
              if (emittedArtifactCategory.has(key)) continue;
              emittedArtifactCategory.add(key);

              detections.push({
                id,
                category,
                name: signal,
                source: `handoff*${scopeLabel}`,
                confidence: "high",
                tier,
                taxonomyMatch: id,
                points,
                scanScope: scope,
              });
            }
            continue;
          }

          // dependsOn: skip if dependency artifact doesn't exist
          if (entry.dependsOn) {
            const depExists = await fileExists(join(basePath, entry.dependsOn));
            if (!depExists) continue;
          }

          const pass = await runCheck(entry, basePath);
          if (!pass) continue;

          if (isMulti(entry)) {
            for (const em of entry.emissions) {
              const key = `${artifact}:${em.category}`;
              if (emittedArtifactCategory.has(key)) continue;
              emittedArtifactCategory.add(key);

              const scopeLabel = scope === "project" ? "" : ` [${scope}]`;
              detections.push({
                id: em.id,
                category: em.category,
                name: em.signal,
                source: `${artifact}${scopeLabel}`,
                confidence: "high",
                tier: em.tier,
                taxonomyMatch: em.id,
                points: em.points,
                scanScope: scope,
              });
            }
          } else {
            const key = `${artifact}:${entry.category}`;
            if (emittedArtifactCategory.has(key)) continue;
            emittedArtifactCategory.add(key);

            const scopeLabel = scope === "project" ? "" : ` [${scope}]`;
            detections.push({
              id: entry.id,
              category: entry.category,
              name: entry.signal,
              source: `${artifact}${scopeLabel}`,
              confidence: "high",
              tier: entry.tier,
              taxonomyMatch: entry.id,
              points: entry.points,
              scanScope: scope,
            });
          }

          // For project scope, first match wins (highest tier due to ordering)
          if (scope === "project") break;
        }
      }
    }

    // 4. Monorepo consistency bonus: >5 workspaces + consistent AI config
    if (workspaces.length > 5) {
      detections.push({
        id: "ufs:monorepo:large",
        category: "ops",
        name: "Monorepo >5 workspaces",
        source: `${workspaces.length} workspaces`,
        confidence: "high",
        tier: "basic",
        taxonomyMatch: "ufs:monorepo:large",
        points: 3,
        scanScope: "project",
      });

      // Check for consistent AI config across workspaces
      let withClaudeMd = 0;
      for (const ws of workspaces) {
        if (await fileExists(join(ws, "CLAUDE.md"))) withClaudeMd++;
      }
      if (withClaudeMd >= workspaces.length * 0.5) {
        detections.push({
          id: "ufs:monorepo:ai-consistent",
          category: "tooling",
          name: "Consistent AI config across workspaces",
          source: `${withClaudeMd}/${workspaces.length} workspaces with CLAUDE.md`,
          confidence: "high",
          tier: "basic",
          taxonomyMatch: "ufs:monorepo:ai-consistent",
          points: 5,
          scanScope: "project",
        });
      }
    }

    // 5. MCP SDK Pioneer flag
    const mcpSdkDetection = detections.find(d => d.id === "ufs:mcp-sdk:pioneer");
    if (mcpSdkDetection) {
      mcpSdkDetection.details = { ...mcpSdkDetection.details, pioneer: true };
    }

    return {
      scanner: this.name,
      detections,
      duration: Math.round(performance.now() - start),
    };
  }
}

// ---------------------------------------------------------------------------
// Run a single check
// ---------------------------------------------------------------------------
async function runCheck(entry: ConfigEntry, basePath: string): Promise<boolean> {
  const checkType = entry.check;
  const artifact = entry.artifact;

  switch (checkType) {
    case "exists":
      return checkExists(basePath, artifact);

    case "lineCount": {
      const threshold = ("threshold" in entry ? entry.threshold : undefined) ?? 0;
      return checkLineCount(basePath, artifact, threshold);
    }

    case "dirChildren": {
      const threshold = ("threshold" in entry ? entry.threshold : undefined) ?? 0;
      const result = await checkDirChildren(basePath, artifact, threshold);
      return result.pass;
    }

    case "grepKeywords": {
      const keywords = ("keywords" in entry ? entry.keywords : undefined) ?? [];
      const threshold = "threshold" in entry ? entry.threshold : undefined;
      return checkGrepKeywords(basePath, artifact, keywords, threshold);
    }

    case "jsonField": {
      const jsonPath = ("jsonPath" in entry ? entry.jsonPath : undefined) ?? "";
      const threshold = ("threshold" in entry ? entry.threshold : undefined) ?? 0;
      return checkJsonField(basePath, artifact, jsonPath, threshold);
    }

    case "shell": {
      const keywords = ("keywords" in entry ? entry.keywords : undefined) ?? [];
      return checkShell(artifact, keywords);
    }

    case "testRatio": {
      const threshold = ("threshold" in entry ? entry.threshold : undefined) ?? 0;
      const result = await checkTestRatio(basePath, threshold);
      return result.pass;
    }

    case "filePermission":
      return checkFilePermission(basePath, artifact);

    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// Exported supersedes map: v2 ID → UFS IDs that replace it
// ---------------------------------------------------------------------------
/** Map each v2 detection ID to the UFS detection IDs that can replace it. */
export function getSupersededMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const entry of CHECKS) {
    if (!entry.supersedes) continue;
    const ids = isMulti(entry)
      ? entry.emissions.map(e => e.id)
      : [entry.id];
    const existing = map.get(entry.supersedes) ?? [];
    existing.push(...ids);
    map.set(entry.supersedes, existing);
  }
  return map;
}
