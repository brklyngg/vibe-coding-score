# CLAUDE.md — Vibe Coder Score

## What This Is

Three-package monorepo: `@vibe/scoring` (shared types + scoring engine) + `vibecheck-score` (npm CLI that scans your AI coding setup) + `vibecheck-web` (Next.js 15 web app that displays scores, generates shareable cards, hosts comparisons, and provides Opus-powered personalized analysis).

## Monorepo Structure

```
vibecheck/
├── migrations/         # SQL migrations for Supabase (run manually in SQL Editor)
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
│       │   ├── submit.ts          # submitResult() — token management, sanitization, sends fullDetections, returns token
│       │   ├── sanitize.ts        # sanitizeForSubmit() — whitelist layer that strips sensitive details before network calls
│       │   ├── compare.ts         # compareApi() + interactiveCompare() + maybeMergeFirst() — compare creation/join with pre-merge option
│       │   ├── merge.ts           # interactiveMerge() + fetchRemoteDetections() — multi-machine merge (returns ProbeResult | null)
│       │   └── post-scan.ts       # postScanFlow() — 3-option interactive menu after every scan
│       ├── taxonomy/
│       │   ├── registry.json      # 171-entry lookup table (id, name, category, tier, signals)
│       │   └── classifier.ts      # RawFinding → Detection[] via registry lookup
│       ├── scanners/              # 11 scanners (environment, mcp, agents, orchestration, repositories, memory, security, deploy, social, git-history, universal-file)
│       └── output/
│           ├── terminal.ts        # chalk + ora rich CLI output (wrapText helper, expanded taxonomy table, no next-tier)
│           └── narrative.ts       # Data-driven narrative: references MCP server names, tool names, pattern counts
└── packages/web/       # Next.js 15: vibecheck.dev
    └── src/
        ├── app/
        │   ├── api/og/[handle]/route.tsx                    # Satori OG image generation
        │   ├── api/submit/route.ts                          # Submit probe results (stores fullDetections + clears stale analysis on update)
        │   ├── api/compare/route.ts                         # Create/join comparisons
        │   ├── api/result/[handle]/detections/route.ts      # Public GET: sanitized detections only (SECURITY CONTRACT: never serves full_detections)
        │   ├── api/analysis/[handle]/route.ts               # GET: Opus-powered analysis (token auth, 24h cache, 200/day budget)
        │   ├── api/analysis/[handle]/chat/route.ts          # POST: streaming follow-up chat (token auth, 10 msg/hr rate limit)
        │   ├── result/[handle]/page.tsx                     # Individual result page + AnalysisSection for authenticated owners
        │   └── compare/[code]/page.tsx                      # Side-by-side comparison + CompareAnalysis for authenticated viewers
        ├── lib/
        │   ├── mock-data.ts           # Mock detections + MOCK_RESULT for /result/demo
        │   ├── narrative-templates.ts  # Tier taglines, pioneer hooks, dimension commentary, web narrative generator
        │   ├── satori-card.tsx        # Card component for Satori rendering
        │   └── radar-svg.tsx          # Inline SVG radar chart (8 dimensions)
        └── components/
            ├── AnalysisSection.tsx     # Client: token auth (URL → localStorage), fetches Opus analysis, chat UI
            ├── CompareAnalysis.tsx     # Client: comparative Opus analysis for authenticated compare viewers
            ├── ChatMessage.tsx         # Client: single chat message (user/assistant)
            ├── ChatInput.tsx           # Client: text input with send button
            ├── PioneerCard.tsx         # Gold-border pioneer card wrapper
            ├── RefreshTimer.tsx        # Auto-refresh client component (compare waiting state)
            ├── CopyBlock.tsx           # Pre block with copy button
            └── CommandBlock.tsx        # Terminal command display with $ prompt + copy
```

## Key Commands

```bash
npm run build           # Build all three packages (scoring → probe → web)
npm run build:scoring   # Build shared scoring package
npm run build:probe     # esbuild bundle probe → single dist/index.js (zero runtime deps)
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

**Probe build:** Uses esbuild (`build.mjs`) to bundle all dependencies — including `@vibe/scoring`, `chalk`, and `ora` — into a single `dist/index.js`. The published npm package has zero runtime dependencies.

**Web dependencies:** `@anthropic-ai/sdk` for Opus analysis/chat. Requires `ANTHROPIC_API_KEY` env var.

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

The probe runs 11 scanners in parallel via `Promise.allSettled` (9 v2 scanners + GitHistoryScanner + UniversalFileScanner last). After all scanners complete, artifact-level dedup suppresses v2 detections when UFS covers the same artifact. Remaining detections are deduped by ID and fed into `computeScore()`.

**UFS architecture:** One config-driven scanner with ~50 checks and 6 check functions. Checks are ordered highest-threshold-first per artifact; conditional chains emit only the highest match per (artifact, category) pair. Scopes (`project`/`workspace`/`global`) control where checks run; global scope runs by default (use `--shallow` to skip).

Terminal output: top separator → VIBE CODER SCORE header → level/tier + tagline → narrative (data-driven with tool names) → category bar chart → WHAT WE FOUND (expanded taxonomy table with sub-lines for named detections) → key mechanisms → pioneer badge → GROWTH AREAS → bottom separator.

## Privacy & Security Architecture

**Two-tier detection model:**
- `probe_result.detections` — sanitized (names/paths stripped), served publicly via `/api/result/[handle]/detections`
- `full_detections` — unsanitized (tool names preserved), stored server-side only, used exclusively by Opus analysis endpoints. NEVER exposed via any public GET endpoint.

**Submission sanitization:** `sanitizeForSubmit()` in `flows/sanitize.ts` runs inside `submitResult()` before any network call. Whitelist approach: only numeric/enum details pass through, paths normalized to generic labels, platform redacted. The POST body sends both `probeResult` (sanitized) and `fullDetections` (unsanitized) — the server stores them in separate columns.

**Grep-over-readFile:** Scanners that check `.env`, shell configs, and crontab use `shellOutput()` with `grep`. Secret values never enter process memory.

**Consent prompt:** First interactive run shows disclosure, writes `~/.vibecheck/consent` on acceptance.

**Token-based ownership:** `~/.vibecheck/token` (UUID) identifies the machine. Returned as `token` in `SubmitOutcome` for private analysis links.

## Post-Scan Flow

After every interactive scan (non-JSON, non-flag), a 3-option menu: multi-machine merge, compare with friend, or done. The compare path now includes a `maybeMergeFirst()` prompt before joining, available in both flag (`--compare`) and interactive paths.

## Compare Mode

Two-person comparison flow via `--compare` flag (requires `--submit`). Web compare page shows side-by-side dimension bars (single row per category), divergence analysis, unique detections with actionable hints, and footer links to individual results.

## Multi-Machine Merge

Two merge modes: `--merge <file>` (local JSON) and `--merge-from <handle>` (remote fetch). `interactiveMerge()` returns `ProbeResult | null` so callers can chain the merged result into compare flows. Merge prompt includes expanded AI assistant instructions with safety guidance.

## Opus-Powered Analysis (Web)

**Authentication:** Submission token passed via URL query param (`?token=...`), stored in `localStorage` keyed by handle. Client components check URL first, then localStorage.

**Analysis endpoint** (`GET /api/analysis/[handle]?token=...`):
- Validates token against `submission_token` in DB
- Uses `full_detections` (falls back to `probe_result.detections`)
- 24-hour cache via `analysis_text` + `analysis_generated_at` columns
- Daily budget: 200 analyses/day (~$20/day at Opus pricing)
- Supports comparative analysis via `?compare=otherHandle` query param
- Model: `claude-opus-4-6-20250219`, max_tokens 1024

**Chat endpoint** (`POST /api/analysis/[handle]/chat?token=...`):
- Streaming response via ReadableStream
- Rate limit: 10 messages/handle/hour (tracked via `chat_count` + `chat_window_start` columns)
- System prompt includes full detection data for contextual answers

**Supabase columns on `results` table:**
- `full_detections` (JSONB) — unsanitized detection array
- `analysis_text` (TEXT) — cached Opus analysis
- `analysis_generated_at` (TIMESTAMPTZ) — cache timestamp
- `chat_count` (INT) — rate limit counter
- `chat_window_start` (TIMESTAMPTZ) — rate limit window start
- Analysis cache is cleared on re-submit (update path sets both to null)

## Context Docs

Source specs live in `../Context/`: PRD v2.4, Taxonomy v1.3, Audio transcript. These define the full scoring rubric, taxonomy entries, and tone.
