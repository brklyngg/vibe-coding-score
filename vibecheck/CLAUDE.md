# CLAUDE.md — Vibe Coder Score

## What This Is

Two-package monorepo: `vibecheck-probe` (npm CLI that scans your AI coding setup) + `vibecheck.dev` (Next.js 15 web app that displays scores, generates shareable cards).

## Monorepo Structure

```
vibecheck/
├── packages/probe/     # npm: vibecheck-probe (TypeScript CLI)
│   └── src/
│       ├── index.ts               # CLI entry point (--help, --json, --merge, --submit)
│       ├── types.ts               # ProbeResult, Detection, ScoreResult, TaxonomyCategory
│       ├── scoring/engine.ts      # detections → category scores → level → tier → type code → pioneer
│       ├── scoring/tiers.ts       # tier lookup helpers
│       ├── taxonomy/
│       │   ├── registry.json      # 93-entry lookup table (id, name, category, tier, signals)
│       │   └── classifier.ts      # RawFinding → Detection[] via registry lookup
│       ├── scanners/
│       │   ├── index.ts           # Scanner interface + runAllScanners (Promise.allSettled)
│       │   ├── utils.ts           # fileExists, readFileIfExists, readJsonIfExists, shellOutput
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
│           ├── terminal.ts        # chalk + ora rich CLI output (bar chart, narrative)
│           └── narrative.ts       # Dimension commentary + narrative generator
└── packages/web/       # Next.js 15: vibecheck.dev
    └── src/
        ├── app/               # App router pages + API routes
        │   └── api/og/[handle]/route.tsx  # Satori OG image generation
        ├── lib/
        │   ├── types.ts               # Duplicated from probe (rule of three)
        │   ├── scoring.ts             # Duplicated scoring engine
        │   ├── mock-data.ts           # Realistic mock detections for dev
        │   ├── narrative-templates.ts  # Tier taglines, archetype names, pioneer hooks
        │   ├── satori-card.tsx        # Card component for Satori rendering
        │   └── radar-svg.tsx          # Inline SVG radar chart (8 dimensions)
        └── components/
            └── PioneerCard.tsx        # Gold-border pioneer card wrapper
```

## Key Commands

```bash
npm run dev:web      # Next.js dev server
npm run build:web    # Production build (verified passing)
npm run build:probe  # TypeScript compile probe + copy registry.json to dist

# Run the probe CLI locally
node packages/probe/dist/index.js --help
node packages/probe/dist/index.js --json         # JSON output (ProbeResult shape)
node packages/probe/dist/index.js --merge f.json # Merge detections from another scan
```

## Scoring System

- 8 categories: intelligence, tooling, continuity, autonomy, ship, security, ops, social
- Tier points: basic=5, intermediate=15, advanced=25, elite=35
- Weights: intelligence 15%, tooling 15%, continuity 13%, autonomy 15%, ship 15%, security 12%, ops 10%, social 5%
- 4-letter type code: M/V (intelligence), A/G (autonomy), R/C (ship), D/L (depth = avg tooling+continuity+ops)
- Pioneer: ≥1 high-confidence or ≥3 medium-confidence innovation flags (taxonomyMatch === null)

## 9 Tier Titles

Observer (0-10) → Apprentice (11-20) → Practitioner (21-30) → Builder (31-45) → Operator (46-55) → Commander (56-65) → Architect (66-75) → Orchestrator (76-85) → Industrialist (86-100)

## Scanner Pipeline

The probe runs 9 scanners in parallel via `Promise.allSettled`. Each scanner emits `RawFinding[]`, passes them through `classify()` which maps IDs to the registry for category/tier/name, and returns `ScanResult`. Unknown IDs get `taxonomyMatch: null` (innovation candidates). The CLI deduplicates by ID and feeds detections directly into `computeScore()` — no confirmation prompt.

Terminal output: tier header → narrative paragraph (2-3 sentences from dimension commentary) → aligned bar chart → detection list → pioneer badge → growth areas → next tier hint.

Registry is a flat JSON array (93 entries) — editable without recompilation. The repositories scanner walks sub-projects up to 2 levels deep (any dir with `package.json`, skipping `node_modules`/`.git`/`dist`/`build`/`.next`/`.turbo`) to find configs that only exist in sub-packages. It also detects monorepo orchestration tools (turbo, nx, pnpm-workspace, lerna). The `--merge` flag lets you combine detections from scans run on different machines (e.g., agent machines for autonomy scoring). No network calls (privacy-first); social scanner is local-only for v1.

Narrative commentary is duplicated in `packages/probe/src/output/narrative.ts` and `packages/web/src/lib/narrative-templates.ts` — extract to `@vibecheck/core` when a third consumer appears.

## Context Docs

Source specs live in `../Context/`: PRD v2.4, Taxonomy v1.3, Audio transcript. These define the full scoring rubric, taxonomy entries, and tone.

## Known Issue

OG image route (`/api/og/[handle]`) fails at runtime with Satori error: "Expected <div> to have explicit display: flex or display: none if it has more than one child node." The SVG radar chart and some card divs need Satori-compatible layout fixes.
