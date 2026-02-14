# Vibe Coder Score

Scan your AI coding setup and get a score. Detects models, agents, MCP servers, memory systems, deploy pipelines, security practices, and more — then rates your setup across 8 dimensions.

## Quick Start

```bash
npx vibecheck-score
```

That's it. Run it in any project directory (or your home directory for a global scan).

### Options

```
--json          Output raw JSON (pipe to other tools)
--shallow       Skip global checks (~/.zshrc, crontab) for faster scan
--submit        Upload results to vibecheck.crunchy.tools for a shareable card
--handle <name> Custom handle for your result page
--compare       Create or join a side-by-side comparison
```

## What It Scans

The probe runs 11 scanners in parallel, checking ~170 signals across 8 categories:

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

### What It Doesn't Do

- **No network calls** during scanning (privacy-first). The only network call is `--submit`, which is opt-in.
- **No file contents are uploaded.** Only detection metadata (tool name, category, confidence) is submitted.
- **No secrets leave your machine.** API key checks only confirm presence, not values.

## Scoring

Each detection earns points based on its tier (basic through elite). Points are weighted across the 8 categories to produce a score from 0-100 and a tier title:

**Observer** (0-10) > **Apprentice** (11-20) > **Practitioner** (21-30) > **Builder** (31-45) > **Operator** (46-55) > **Commander** (56-65) > **Architect** (66-75) > **Orchestrator** (76-85) > **Industrialist** (86-100)

You also get a 4-letter type code (like MARC or VGCD) describing your style across intelligence, autonomy, shipping, and depth dimensions.

## Web App

Results submitted with `--submit` are viewable at `vibecheck.crunchy.tools/result/<handle>`, including an OG image card for sharing. The `--compare` flag enables side-by-side comparisons.

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

## Contributing

Issues and PRs welcome. If you want to add a new scanner or detection signal:

1. Add entries to `packages/probe/src/taxonomy/registry.json`
2. Implement the detection logic in the appropriate scanner under `packages/probe/src/scanners/`
3. Run `npm run build:probe` and test with `node packages/probe/dist/index.js`

## License

MIT
