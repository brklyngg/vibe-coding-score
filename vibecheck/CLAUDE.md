# CLAUDE.md — Vibe Coder Score

## What This Is

Three-package monorepo: `@vibe/scoring` (shared types + scoring engine) + `vibecheck-score` (npm CLI that scans your AI coding setup) + `vibecheck-web` (Next.js 15 web app that displays scores, generates shareable cards, and hosts side-by-side comparisons).

## Monorepo Structure

```
vibecheck/
├── packages/scoring/   # @vibe/scoring — shared types + scoring engine
│   └── src/
│       ├── index.ts               # Re-exports types + engine
│       ├── types.ts               # ProbeResult, Detection, ScoreResult, CategoryScore, TypeCode, etc.
│       └── engine.ts              # computeScore, computeCategoryScores, computeLevel, assignTier, computeTypeCode, evaluatePioneer
├── packages/probe/     # npm: vibecheck-score (TypeScript CLI)
│   └── src/
│       ├── index.ts               # CLI entry point (--help, --json, --shallow, --merge, --merge-from, --submit, --compare)
│       ├── types.ts               # Re-export shim → @vibe/scoring
│       ├── scoring/engine.ts      # Re-export shim → @vibe/scoring
│       ├── scoring/tiers.ts       # tier lookup helpers
│       ├── flows/
│       │   ├── index.ts           # Barrel re-exports
│       │   ├── submit.ts          # submitResult() — token management, confirmation, POST to /api/submit
│       │   ├── compare.ts         # compareApi() + interactiveCompare() — compare creation/join
│       │   ├── merge.ts           # interactiveMerge() + fetchRemoteDetections() — multi-machine merge
│       │   └── post-scan.ts       # postScanFlow() — 3-option interactive menu after every scan
│       ├── taxonomy/
│       │   ├── registry.json      # 171-entry lookup table (id, name, category, tier, signals)
│       │   └── classifier.ts      # RawFinding → Detection[] via registry lookup
│       ├── scanners/
│       │   ├── index.ts           # Scanner interface + runAllScanners (Promise.allSettled)
│       │   ├── utils.ts           # fileExists, readFileIfExists, readJsonIfExists, shellOutput
│       │   ├── workspace.ts       # Monorepo detection + workspace discovery (2-level walk, cap 20)
│       │   ├── universal-file.ts  # Config-driven UFS: ~50 checks, 6 check types, multi-category emissions, supersedes v2
│       │   ├── git-history.ts     # Git log analysis: commit style, velocity, branches, test/doc ratios, time patterns
│       │   ├── environment.ts     # API keys (.env + shell config), model routing, local models
│       │   ├── mcp.ts             # MCP servers (Code + Desktop + project-scoped), CLI tools
│       │   ├── agents.ts          # Subagents, hooks, AGENTS.md, SOUL.md, EVOLVE.md, skills, commands
│       │   ├── orchestration.ts   # tmux, worktrees, orchestrator CLIs, crontab
│       │   ├── repositories.ts    # CI/CD, test/E2E configs, lint/format, TS strict, npm scripts, sub-project scanning, monorepo tools
│       │   ├── memory.ts          # CLAUDE.md, memories, rules, cursorrules, windsurfrules, copilot, logs
│       │   ├── security.ts        # gitignore, file perms, agent perms, canary tokens
│       │   ├── deploy.ts          # vercel/netlify/fly/cloudflare/docker configs, deploy CLIs
│       │   └── social.ts          # git remote, npm public, webhooks
│       └── output/
│           ├── terminal.ts        # chalk + ora rich CLI output (taxonomy table with innovation markers, bar chart, growth areas)
│           └── narrative.ts       # Dimension commentary, archetype data, narrative generator
└── packages/web/       # Next.js 15: vibecheck.dev
    └── src/
        ├── app/               # App router pages + API routes
        │   ├── api/og/[handle]/route.tsx  # Satori OG image generation
        │   ├── api/submit/route.ts        # Submit probe results
        │   ├── api/compare/route.ts       # Create/join comparisons
        │   ├── api/result/[handle]/detections/route.ts  # Public GET: return detections for a handle
        │   ├── result/[handle]/page.tsx   # Individual result page
        │   └── compare/[code]/page.tsx    # Side-by-side comparison (waiting + complete states)
        ├── lib/
        │   ├── mock-data.ts           # Mock detections + MOCK_RESULT for /result/demo
        │   ├── narrative-templates.ts  # Tier taglines, archetype names, pioneer hooks
        │   ├── satori-card.tsx        # Card component for Satori rendering
        │   └── radar-svg.tsx          # Inline SVG radar chart (8 dimensions)
        └── components/
            ├── PioneerCard.tsx        # Gold-border pioneer card wrapper
            ├── RefreshTimer.tsx       # Auto-refresh client component (compare waiting state)
            ├── CopyBlock.tsx          # Pre block with copy button
            └── CommandBlock.tsx       # Terminal command display with $ prompt + copy
```

## Key Commands

```bash
npm run build           # Build all three packages (scoring → probe → web)
npm run build:scoring   # Build shared scoring package
npm run build:probe     # TypeScript compile probe + copy registry.json to dist
npm run build:web       # Next.js production build
npm run dev:web         # Next.js dev server

# Run the probe CLI locally
node packages/probe/dist/index.js --help
node packages/probe/dist/index.js --json         # JSON output (ProbeResult shape)
node packages/probe/dist/index.js --shallow       # Skip global checks (crontab, launchd) for faster scan
node packages/probe/dist/index.js --merge f.json       # Merge detections from a local JSON file
node packages/probe/dist/index.js --merge-from handle  # Fetch & merge detections from a submitted handle
```

## Package Dependencies

Both `probe` and `web` depend on `@vibe/scoring` (npm workspace link). Build order matters: scoring must build before probe and web. The root `build` script chains them correctly.

All types and scoring logic live in `@vibe/scoring`. Probe's `types.ts` and `scoring/engine.ts` are re-export shims for backward compatibility. Web imports directly from `@vibe/scoring`.

## Scoring System

- 8 categories: intelligence, tooling, continuity, autonomy, ship, security, ops, social
- Tier points: basic=5, intermediate=15, advanced=25, elite=35 (overridden by `Detection.points` when set)
- UFS detections use exact spec points (3/5/8/10/15/20) via `points` field; v2 detections use tier-based
- Weights: intelligence 15%, tooling 15%, continuity 13%, autonomy 15%, ship 15%, security 12%, ops 10%, social 5%
- 4-letter type code: M/V (intelligence), A/G (autonomy), R/C (ship), D/L (depth = avg tooling+continuity+ops)
- Pioneer: ≥1 high-confidence or ≥3 medium-confidence innovation flags (taxonomyMatch === null)

## 9 Tier Titles

Observer (0-10) → Apprentice (11-20) → Practitioner (21-30) → Builder (31-45) → Operator (46-55) → Commander (56-65) → Architect (66-75) → Orchestrator (76-85) → Industrialist (86-100)

## Scanner Pipeline

The probe runs 11 scanners in parallel via `Promise.allSettled` (9 v2 scanners + GitHistoryScanner + UniversalFileScanner last). Each v2 scanner emits `RawFinding[]`, passes them through `classify()` which maps IDs to the registry for category/tier/name, and returns `ScanResult`. The UFS builds `Detection[]` directly with exact spec points — no classify() pass needed.

After all scanners complete, artifact-level dedup suppresses v2 detections when UFS covers the same artifact (e.g., UFS `ufs:claude-md:rich` supersedes v2 `claude-md`). The `supersedes` field on UFS config entries declares which v2 IDs to drop. Remaining detections are deduped by ID and fed into `computeScore()`.

**UFS architecture:** One config-driven scanner with a typed array of ~50 checks and 6 check functions (`exists`, `lineCount`, `dirChildren`, `grepKeywords`, `jsonField`, `shell`, `testRatio`, `filePermission`). Checks are ordered highest-threshold-first per artifact; conditional chains emit only the highest match per (artifact, category) pair. Multi-category emissions let one artifact award points across multiple categories. Scopes (`project`/`workspace`/`global`) control where checks run; global scope runs by default (use `--shallow` to skip). `--deep` is kept as a silent no-op for backward compat.

Terminal output: top separator → VIBE CODER SCORE header → level/tier + tagline → narrative → category bar chart → WHAT WE FOUND (taxonomy table with `*` innovation markers) → key mechanisms → pioneer badge → GROWTH AREAS (commentary) → next tier → bottom separator. Type code is computed for JSON output but not displayed in terminal.

## Post-Scan Flow

After every interactive scan (non-JSON, non-flag), a 3-option menu appears:
1. **I also use AI tools on another machine** — submits current scan, prints `--merge-from <handle>` command, then polls for merged results from Machine B (5s interval, 5min timeout, Enter to skip). On success, renders combined results and offers compare option
2. **Compare with a friend** — submits current scan, asks for existing code or creates new comparison
3. **Done** (default on Enter)

Guards: skipped when `--json`, `--submit`, `--yes`, `--compare`, `--merge-from`, or non-TTY stdin.

The `flows/` module contains extracted logic: `submitResult()`, `compareApi()`, `interactiveMerge()`, `interactiveCompare()`, `fetchRemoteDetections()`, `postScanFlow()`. The `--submit` flag path in `index.ts` calls these functions directly (separate entry point from the interactive menu).

## Compare Mode

Two-person comparison flow via `--compare` flag (requires `--submit`):
- `--compare create`: POSTs to `/api/compare` with `action: "create"`, gets back a 6-char hex code
- `--compare <code>`: POSTs to `/api/compare` with `action: "join"`, gets back compare URL
- DB: `comparisons` table (code, handle_a, handle_b, timestamps). Race-condition guard via `.is("handle_b", null)` on join
- Web: `/compare/[code]` page — waiting state with 15s auto-refresh (`RefreshTimer`), complete state with identity cards, dimension bars (indigo/emerald), divergence analysis, unique detections comparison
- Handle auto-generated as 8-char hex if `--handle` omitted

## Multi-Machine Merge

Two merge modes: `--merge <file>` (local JSON) and `--merge-from <handle>` (fetches from `/api/result/[handle]/detections`). Mutually exclusive. Both dedup by detection ID into the existing scan results.

**Bidirectional round-trip:** Machine A submits its scan and polls for `{handle}-merged`. Machine B runs `--merge-from {handle}`, computes combined results, renders them, and auto-submits as `{handle}-merged` (handle capped to 31 chars + `-merged` suffix). Machine A's poll detects the upload, renders the combined score, and offers a compare option. Uses existing `/api/submit` and `/api/result/[handle]/detections` endpoints — no new API routes needed.

Registry is a flat JSON array (171 entries) — editable without recompilation. The repositories scanner walks sub-projects up to 2 levels deep.

Narrative commentary lives in `packages/probe/src/output/narrative.ts`. Archetype names/descriptions are defined there and also in `packages/web/src/lib/narrative-templates.ts` (web uses them for satori cards and result pages).

## Context Docs

Source specs live in `../Context/`: PRD v2.4, Taxonomy v1.3, Audio transcript. These define the full scoring rubric, taxonomy entries, and tone.
