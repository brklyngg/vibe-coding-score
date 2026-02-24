# How Vibecheck Works

**Vibecheck** scans your coding environment to measure how deeply AI tools are integrated into your workflow. It runs 10 scanners across your machine, classifies what it finds into 8 dimensions, computes a weighted score (0-100), and generates a shareable result page with an Opus-powered analysis. Think of it as a "credit score" for your AI coding setup.

Package: `npx vibecheck-score` | Web: `vibecheck.crunchy.tools`

---

## Single-Machine Flow

```
  YOU RUN: npx vibecheck-score
       │
       ▼
  ┌──────────────────────────────────────────────────────┐
  │              10 SCANNERS (run in parallel)            │
  │                                                      │
  │  EnvironmentScanner    MemoryScanner                 │
  │  McpScanner            SecurityScanner               │
  │  OrchestrationScanner  DeployScanner                 │
  │  RepositoriesScanner   SocialScanner                 │
  │  GitHistoryScanner     UniversalFileScanner (~70     │
  │                         checks, runs last, dedupes)  │
  └──────────────────────────┬───────────────────────────┘
                             │  RawFinding[] per scanner
                             ▼
  ┌──────────────────────────────────────────────────────┐
  │                    CLASSIFIER                        │
  │                                                      │
  │  Looks up each finding ID in registry.json (~200     │
  │  known patterns). Maps to category + tier + name.    │
  │                                                      │
  │  Unknown IDs → category fallback "tooling",          │
  │  taxonomyMatch = null → Pioneer badge signal         │
  └──────────────────────────┬───────────────────────────┘
                             │  Detection[] (classified)
                             ▼
  ┌──────────────────────────────────────────────────────┐
  │                  SCORING ENGINE                      │
  │                                                      │
  │  Tier points: basic=5, intermediate=15,              │
  │               advanced=25, elite=35                  │
  │  (UFS overrides: 3/5/8/10/15/20 per check)          │
  │                                                      │
  │  Category scores capped at 100, then weighted sum:   │
  │  Intelligence 15% │ Tooling 15%  │ Continuity 13%   │
  │  Autonomy    15% │ Ship    15%  │ Security   12%    │
  │  Ops         10% │ Social   5%  │                    │
  │                                                      │
  │  → Final level 0-100, tier title, 4-letter type code │
  └──────────────────────────┬───────────────────────────┘
                             │
                             ▼
  ┌──────────────────────────────────────────────────────┐
  │               TERMINAL OUTPUT                        │
  │                                                      │
  │  Score, tier title, type code, category breakdown,   │
  │  detection list. Auto-submits silently in the        │
  │  background (sanitized + full detections).           │
  │                                                      │
  │  Prints:                                             │
  │   Share URL:   vibecheck.crunchy.tools/result/X      │
  │   Private URL: ...?token=<submissionToken>           │
  │                                                      │
  │  Menu: [1] Merge  [2] Compare  [Enter] Open browser │
  └──────────────────────────┬───────────────────────────┘
                             │  User presses Enter
                             ▼
  ┌──────────────────────────────────────────────────────┐
  │                  WEB RESULT PAGE                     │
  │                                                      │
  │  Public view: score, categories, sanitized findings  │
  │  Private view (with token): triggers Opus analysis   │
  │                                                      │
  │  GET /api/analysis/<handle>?token=...                │
  │  → Validates token → reads full_detections from DB   │
  │  → Calls claude-opus-4-6 (max 512 tokens)           │
  │  → Caches result for 24h                             │
  │  → Follow-up chat available (10 msgs/hr limit)       │
  └──────────────────────────────────────────────────────┘
```

---

## Two-Machine Setup (Merge Flow)

For people who use AI tools on multiple machines — e.g., Claude Code CLI on your main PC and clawdbot on a second PC. The merge combines detections from both so your score reflects everything.

```
  MACHINE A (main PC)                  MACHINE B (clawdbot PC)
  ────────────────────                 ────────────────────────

  npx vibecheck-score
       │
  Scan + Score
       │
  Terminal shows results
  + auto-submits as
  handle "gary"
       │
  Menu: pick [1]
  "I also use AI on
   another machine"
       │
       ▼
  ┌─────────────────┐
  │ Prints command:  │
  │ npx vibecheck-  │──────── you copy this to ────────┐
  │ score --merge-   │        Machine B                 │
  │ from gary        │                                  │
  └────────┬────────┘                                   │
           │                                            ▼
           │                                  npx vibecheck-score
           │                                    --merge-from gary
  ┌─────────────────┐                                   │
  │  POLLING...      │                                  ▼
  │  Checks for      │                        ┌─────────────────┐
  │  "gary-merged"   │                        │  Scan Machine B  │
  │  every 5 sec     │                        │  (10 scanners)   │
  │  (5 min timeout) │                        └────────┬────────┘
  └────────┬────────┘                                   │
           │                                            ▼
           │                                  ┌─────────────────┐
           │                                  │  FETCH + MERGE   │
           │                                  │                  │
           │                                  │  GET /api/result │
           │                                  │   /gary/         │
           │                                  │   detections     │
           │                                  │                  │
           │                                  │  Dedupes by ID,  │
           │                                  │  combines both   │
           │                                  │  detection sets  │
           │                                  └────────┬────────┘
           │                                            │
           │                                            ▼
           │                                  ┌─────────────────┐
           │                                  │  Score combined  │
           │                                  │  Auto-submit as  │
           │                                  │  "gary-merged"   │
           │                                  └────────┬────────┘
           │                                            │
           │◄───── poll finds "gary-merged" ────────────┘
           │
           ▼
  ┌─────────────────┐
  │  Renders merged  │
  │  combined score  │
  │  Opens browser   │
  └─────────────────┘
```

**Key detail:** Machine B fetches Machine A's *sanitized* detections (no secrets leak across the wire). The merged result gets a new Opus analysis based on the combined picture.

---

## Compare With a Friend

Two people scan independently, then see a side-by-side comparison.

```
  PERSON A                              PERSON B
  ────────                              ────────

  npx vibecheck-score
       │
  Scan + Submit
       │
  Menu: pick [2]
  "Compare with a friend"
       │
       ▼
  POST /api/compare
  { action: "create" }
       │
       ▼
  Server generates
  6-char hex code ──────── share code ──────┐
  (e.g., "a3f1b2")         with friend      │
       │                                     │
       ▼                                     ▼
  Terminal prints:                 npx vibecheck-score
  "Share this code: a3f1b2"         --submit --compare a3f1b2
  + command for Person B                     │
                                        Scan + Submit
                                             │
                                             ▼
                                   POST /api/compare
                                   { action: "join",
                                     code: "a3f1b2" }
                                             │
           ┌─────────────────────────────────┘
           ▼
  ┌──────────────────────────────────────────────────────┐
  │  COMPARE PAGE: vibecheck.crunchy.tools/compare/a3f1b2│
  │                                                      │
  │  Side-by-side terminal-aesthetic view:                │
  │  • Both handles, levels, tier titles                 │
  │  • Dual bar charts per category (indigo vs emerald)  │
  │  • "Where You Diverge" — top 3 gap categories        │
  │  • Unique detections each person has                 │
  │  • Opus-powered comparison analysis                  │
  └──────────────────────────────────────────────────────┘
```

---

## What Gets Scanned (8 Categories)

| Category | Wt | What It Measures |
|---|---|---|
| Intelligence | 15% | AI model usage, context management, multi-model routing |
| Tooling | 15% | MCP servers, custom tools, IDE integrations, browser extensions |
| Continuity | 13% | Memory systems, session persistence, CLAUDE.md files, project memory |
| Autonomy | 15% | Autonomous workflows, agents, hooks, delegation patterns |
| Ship | 15% | Deploy automation, CI/CD, preview environments, git workflow velocity |
| Security | 12% | Secrets management, git hooks, permissions config, pre-commit checks |
| Ops | 10% | Monitoring, cron jobs, log analysis, infrastructure-as-code |
| Social | 5% | Sharing configs, community tools, public AI contributions |

**Scoring:** Each detection has a tier (basic=5, intermediate=15, advanced=25, elite=35 points). Category scores cap at 100. Weighted sum = final level 0-100.

**Tier titles:** Observer (0-10) → Apprentice (11-20) → Practitioner (21-30) → Builder (31-45) → Operator (46-55) → Commander (56-65) → Architect (66-75) → Orchestrator (76-85) → Industrialist (86-100)

**Type code** (4 letters like `MARD`): Derived from category scores — M=Model-driven (intelligence>=50), A=Agent (autonomy>=50), R=Relentless (ship>=50), D=Deep (avg tooling+continuity+ops>=50). Opposite letters: V/G/C/L.

---

## Privacy Model

Two-tier system. Scanners never read file contents for secrets — they use `grep` patterns so sensitive values never enter process memory.

```
  ┌──────────────────────────────────────────────────────┐
  │                  DURING SCAN                         │
  │                                                      │
  │  Scanners use grep-based checks (e.g., "does .env   │
  │  exist?" not "what's in .env?"). Secret values       │
  │  never enter process memory.                         │
  │                                                      │
  │  First run shows consent prompt explaining what      │
  │  gets scanned. Consent stored in ~/.vibecheck/       │
  └──────────────────────────┬───────────────────────────┘
                             │
                             ▼
  ┌──────────────────────────────────────────────────────┐
  │           TIER 1: SANITIZED (public)                 │
  │                                                      │
  │  sanitizeForSubmit() runs BEFORE any network call:   │
  │  • platform → "redacted"                             │
  │  • source paths normalized:                          │
  │    ~/.zshrc → "shell-config"                         │
  │    crontab → "crontab"                               │
  │    .claude/agents/* → "agents-dir"                   │
  │  • details stripped to numeric-only whitelist:        │
  │    count, ratio, commitsPerWeek, etc.                │
  │    Tool names, file paths, agent names → dropped     │
  │                                                      │
  │  Stored in DB as: probe_result.detections            │
  │  Served via: GET /api/result/<handle>/detections     │
  │  Used for: public result page, merge-from, compare   │
  └──────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────┐
  │           TIER 2: FULL DETECTIONS (private)          │
  │                                                      │
  │  Raw unsanitized detections with all details.        │
  │                                                      │
  │  Stored in DB as: full_detections (separate column)  │
  │  Accessed ONLY by: /api/analysis/<handle>?token=...  │
  │  Token = UUID stored in ~/.vibecheck/token           │
  │  Used for: Opus analysis only                        │
  │  NEVER served via any public endpoint                │
  └──────────────────────────────────────────────────────┘
```

**The security contract:** The public detections endpoint *never* serves `full_detections`. Only the token-authenticated analysis endpoint can read them, and only to feed Opus for the personalized writeup.
