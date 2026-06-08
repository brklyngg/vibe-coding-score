# Vibe Coder Score

[![npm version](https://img.shields.io/npm/v/vibecheck-score)](https://www.npmjs.com/package/vibecheck-score)
[![npm downloads](https://img.shields.io/npm/dm/vibecheck-score)](https://www.npmjs.com/package/vibecheck-score)

**Scan your AI coding setup and get a score.** Detects models, agents, MCP servers, memory systems, deploy pipelines, security practices, and more — then rates your setup across 8 dimensions.

🌐 **[vibecheck.crunchy.tools](https://vibecheck.crunchy.tools)**

---

## Quick Start

```bash
npx vibecheck-score
```

Runs in ~3 seconds. No installs beyond npx. No network calls during scanning.

### Sample Output

```
  VIBE CODER SCORE

  Level 72 · Architect
  "Context windows are your canvas. Connections are your brushstrokes."

    Intelligence  ████████░░   78
    Tooling       ██████████  100
    Continuity    ████████░░   82
    Autonomy      ██████████  100
    Ship          ██████░░░░   60
    Security      ███████░░░   70
    Ops           █████░░░░░   45
    Social        ███░░░░░░░   28

  KEY MECHANISMS
    Claude Code skills: handoff, review, session-closer, memory
    OpenClaw orchestrator
    Custom MCP servers (3 detected)
    CLAUDE.md deep continuity context

  GROWTH AREAS
    🚀 Ship (60/100) — Add test coverage and formalize your deploy pipeline
    📊 Ops (45/100) — Structured task tracking would boost your score here
```

### Options

```
--json          Output raw JSON (pipe to other tools)
--shallow       Skip global checks (~/.zshrc, crontab) for faster scan
--submit        Upload results to vibecheck.crunchy.tools for a shareable card
--handle <name> Custom handle for your result page
--compare       Create or join a side-by-side comparison
```

---

## What It Scans

The probe runs 11 scanners in parallel, checking ~200 signals across 8 categories:

| Category | What it looks for |
|----------|-------------------|
| **Intelligence** | API keys, model providers, routing aliases, local models |
| **Tooling** | CLI tools, MCP servers, IDE integrations |
| **Continuity** | CLAUDE.md, memory systems, rules, context files |
| **Autonomy** | Subagents, hooks, orchestration, tmux/worktrees |
| **Ship** | CI/CD, test frameworks, deploy configs, npm scripts |
| **Security** | .gitignore coverage, env var handling, agent permissions |
| **Ops** | Task tracking, build scripts, monorepo tooling |
| **Social** | Public repos, npm packages, webhooks |

### Tiers

| Score | Tier | Description |
|-------|------|-------------|
| 0–10 | **Observer** | Getting started |
| 11–20 | **Apprentice** | Basic tooling in place |
| 21–30 | **Practitioner** | Using AI consistently |
| 31–45 | **Builder** | Shipping with AI |
| 46–55 | **Operator** | Deep tool ecosystem |
| 56–65 | **Commander** | AI-native workflows |
| 66–75 | **Architect** | System-level thinking |
| 76–85 | **Orchestrator** | Multi-agent mastery |
| 86–100 | **Industrialist** | Full-stack AI production |

### Prefer to audit first?

```bash
git clone https://github.com/brklyngg/vibe-coding-score.git
cd vibe-coding-score/vibecheck
npm install && npm run build:probe
node packages/probe/dist/index.js
```

---

## Privacy & Security

**During scanning:**
- **No network calls** during scanning. The only network call is `--submit`, which is opt-in.
- **No file contents loaded into memory.** Shell config files (`.zshrc`, `.bashrc`, etc.) and `.env` files are scanned via `grep` — the probe checks for key *names* without ever reading values into the Node process.
- **Crontab is grep-piped**, not dumped — only matching line counts are captured.
- **Git author emails are not collected.** Only names and commit metadata are read.
- **First-run consent prompt** tells you exactly what will be scanned before anything runs.

**When submitting (`--submit`):**
- A `sanitizeForSubmit()` layer strips sensitive details before any network call:
  - File paths like `~/.zshrc` are normalized to generic labels (`shell-config`)
  - Detail fields are whitelisted — only numeric counts and enum-like strings pass through
  - Agent names, alias names, plist filenames, and other identifying details are removed
  - `scanResults.detections` are emptied (only scanner name + duration are sent)
  - `platform` is set to `"redacted"`
- **No IP logging or analytics telemetry** on the server. The submit endpoint source is open at `packages/web/src/app/api/submit/route.ts`.

For full details — scanner inventory, sample output, sanitization pipeline, merge flow — see [vibecheck.crunchy.tools/security](https://vibecheck.crunchy.tools/security).

---

## Scoring

Each detection earns points based on its tier (basic through elite). Points are weighted across the 8 categories to produce a score from 0-100 and a tier title. You also get a **4-letter type code** (like MARC or VGCD) describing your style across intelligence, autonomy, shipping, and depth dimensions.

## Web App

Results submitted with `--submit` are viewable at `vibecheck.crunchy.tools/result/<handle>`, including an OG image card for sharing on Twitter, LinkedIn, or anywhere.

The `--compare` flag enables side-by-side comparisons: create a session code, share it with a teammate, and see exactly where your setups diverge.

---

## Monorepo Structure

```
vibecheck/
  packages/probe/    # npm: vibecheck-score (TypeScript CLI)
  packages/web/      # Next.js 15 web app (vibecheck.crunchy.tools)
```

## Development

```bash
npm install
npm run build:probe   # Compile CLI
npm run build:web     # Build web app
npm run dev:web       # Next.js dev server
```

## Development

Issues and feedback welcome. To run it locally or add a new scanner or detection signal:

1. Add entries to `packages/probe/src/taxonomy/registry.json`
2. Implement the detection logic in the appropriate scanner under `packages/probe/src/scanners/`
3. Run `npm run build:probe` and test with `node packages/probe/dist/index.js`

## License

© Gary Gurevich. All rights reserved. This source is publicly viewable but not licensed for reuse, redistribution, or derivative works.
