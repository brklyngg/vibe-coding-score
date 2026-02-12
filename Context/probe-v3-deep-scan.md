# Probe v3: Deep Scan — Inferring Workflow from Artifacts

**Author:** Jerome (with Gary's direction)
**Date:** 2026-02-02
**Status:** Draft v2.0 (post-engineering-review)
**Purpose:** Spec for `vibecheck-probe` v3 — moving from tool-presence detection to workflow inference from filesystem artifacts.

---

## Table of Contents

1. [Overview & Philosophy](#1-overview--philosophy)
2. [Architecture: Two Scanners](#2-architecture-two-scanners)
   - 2.1 [Universal File Scanner](#21-universal-file-scanner)
   - 2.2 [Git History Analyzer (The Spine)](#22-git-history-analyzer-the-spine)
3. [Pattern Bonuses](#3-pattern-bonuses)
4. [`--deep` Flag & Consent UX](#4---deep-flag--consent-ux)
5. [Trust Document](#5-trust-document)
6. [Privacy Contract](#6-privacy-contract)
7. [Future Phases](#7-future-phases)
8. [Implementation Plan](#8-implementation-plan)

---

## 1. Overview & Philosophy

### What v3 Is

v2 answers: *"What tools do you have?"*
v3 answers: *"How do you actually work?"*

Anybody can `brew install claude`. Writing a 200-line AGENTS.md with custom skills, session closers, and memory architecture is a completely different signal. v3 reads the *shape* of your work to infer workflow patterns and sophistication — without asking a single question.

The magic: "wait, how did it know that?" You run the probe and it tells you things about your own workflow that you didn't explicitly configure anywhere. It inferred them from artifacts.

### Core Principles

1. **Infer, don't interrogate.** Commit patterns reveal work style. Config depth reveals sophistication. File structure reveals planning philosophy. Don't ask — observe.
2. **Minimally invasive, maximally insightful.** Read filenames, not file contents. Read config structure, not credentials. Read git metadata, not diffs.
3. **Name the brilliant things.** When the probe finds something genuinely clever, it should *name* the pattern, explain why it's impressive, and celebrate it.
4. **Transparency is non-negotiable.** Every scan operation is documented. The user sees exactly what was read before submitting.
5. **Git is the spine.** Git history is the only scanner that reveals things users can't fake. Everything else is supporting evidence.

### Relationship to Existing Scoring

v3 feeds into the existing 8 scoring categories from the taxonomy (v1.3):

| Scanner | Primary Categories Affected |
|---------|----------------------------|
| Universal File Scanner | Tooling (🔧), Continuity (🔄), Autonomy (🤖), Ship (🚀), Security (🛡️), Ops (📊) |
| Git History Analyzer | Ship (🚀), Ops (📊), Intelligence (🧠), Social (🤝) |
| Pattern Bonuses | Cross-cutting bonus modifiers |

v3 does NOT change the tier system (Observer → Industrialist), the 4-letter archetype codes, or the Pioneer badge criteria. It makes all of them *more accurate* by feeding richer signals into the existing scoring engine.

---

## 2. Architecture: Two Scanners

v3 has exactly two scanners:

1. **Universal File Scanner** — one function that checks file/directory existence, line counts, and simple heuristics. Runs at project root, each workspace, and optionally `~/` (with `--deep`).
2. **Git History Analyzer** — the complex, high-value part. Reads git metadata to infer work patterns. This is the spine of v3 — the only signal source users can't easily fake.

---

### 2.1 Universal File Scanner

One function. Takes a detection config. Runs it at three scopes: project root, each discovered workspace, and (with `--deep`) the home directory.

#### How It Works

For each detection entry in the config, the scanner checks:
- **Does the file/directory exist?**
- **If file: how many lines?** (line count thresholds distinguish depth)
- **If directory: what children exist?** (subdirectory presence distinguishes depth)

That's it. Three kinds of checks. No framework, no depth levels as a formal system — just simple heuristics that let the numbers speak.

#### Workspace Discovery

Before running detections, discover workspaces:
1. Check for monorepo indicators at root: `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `lerna.json`, `rush.json`, `package.json` with `workspaces` field
2. Find all directories within 2 levels containing `package.json`, excluding `node_modules/`, `.git/`, `dist/`, `build/`, `.next/`, `.turbo/`, `.cache/`, and dotdirs
3. Run the same detection config in each workspace
4. Deduplicate: if found in both root and workspace, keep root. If found in multiple workspaces, note count, emit one detection.

Cap at 20 workspaces. Note truncation if exceeded.

#### Detection Config

Each entry specifies what to look for and what to emit. The full list:

##### AI Tool Customization

| Artifact | Heuristic | Scoring Impact |
|----------|-----------|---------------|
| `CLAUDE.md` | exists → +3 Tooling; >50 lines → +8 Tooling +5 Continuity; >100 lines with section headers containing "architecture"/"security"/"memory"/"agent"/"skill" → +15 Tooling +10 Continuity +5 Autonomy | Primary Claude Code signal |
| `.claude/` | exists → +3 Tooling; contains `settings.json` with non-default content → +5 Tooling; contains `agents/` or `skills/` or `rules/` or `hooks/` → +15 Tooling +5 Autonomy | Claude Code depth |
| `.cursorrules` | exists → +3 Tooling; >30 lines → +8 Tooling +5 Continuity | Cursor depth |
| `.cursor/` | exists → +3 Tooling; has rules dir or custom prompts → +8 Tooling | Cursor ecosystem |
| `.github/copilot-instructions.md` | exists → +3 Tooling; >20 lines → +8 Tooling | Copilot depth |
| `AGENTS.md` | exists → +3 Tooling; >50 lines with behavioral sections → +15 Continuity +10 Autonomy | OpenClaw depth |
| `SOUL.md` | exists → +5 Continuity; >20 lines → +10 Continuity +5 Intelligence | Identity crafting |
| `USER.md` | exists → +3 Continuity | User context |
| `.mcp.json` | exists → +5 Tooling; >3 servers → +10 Tooling; >6 servers → +15 Tooling | MCP breadth |
| `~/.claude/settings.json` (deep) | mcpServers entries → count servers, same thresholds as `.mcp.json` | Global MCP config |
| `package.json` | contains `@modelcontextprotocol/sdk` in deps → +20 Tooling + Pioneer flag | Custom MCP server — toolsmith signal |

**How to measure without reading content:** For line counts, `wc -l`. For section headers, `grep -c '^#'`. For keyword presence, `grep -l 'keyword'` (returns filename, not content). For package.json deps, parse the JSON `dependencies`/`devDependencies` keys only.

##### Memory & Persistence Systems

| Artifact | Heuristic | Scoring Impact |
|----------|-----------|---------------|
| `memory/` | exists → +5 Continuity; >5 dated files (`YYYY-MM-DD.md`) → +10 Continuity; has `active-work.md` → +5 Continuity; has `heartbeat-state.json` → +5 Autonomy | Memory architecture depth |
| `MEMORY.md` | exists → +5 Continuity; >50 lines → +10 Continuity | Curated long-term memory |
| `HEARTBEAT.md` | exists → +5 Autonomy | Proactive agent operation |
| `EVOLVE.md` | exists → +5 Continuity | Self-updating system |
| Files matching `handoff*`, `handover*`, `session-state*` | exist → +5 Continuity | Session handoff |

##### Project Structure

| Artifact | Heuristic | Scoring Impact |
|----------|-----------|---------------|
| `specs/` with >0 files | +10 Ops | Spec-first workflow |
| `docs/PRD*.md` | +10 Ops | Planning discipline |
| Test files (`*.test.*`, `*.spec.*`, `__tests__/`) vs source files (`*.ts`, `*.js`, `*.py`, `*.go`, `*.rs` in `src/`, `app/`, `lib/`) | ratio >0.3 → +15 Ship; >0.1 → +8 Ship; 0 → -5 Ship | Craftsmanship |
| `.env.example` | +5 Social | Collaboration awareness |
| `README.md` | exists → +3 Ops; >100 lines + >3 headers → +8 Ops; has badge patterns (`![`) → +3 Ops | Documentation quality |
| `.github/workflows/` | 1 file → +5 Ship; 2+ files → +10 Ship; any file >100 lines → +5 Ship (matrix builds) | CI maturity |
| `Dockerfile` / `docker-compose.yml` | +5 Ship | Containerization |
| `vercel.json` / `netlify.toml` / `fly.toml` / `render.yaml` | detected, names emitted | Deploy target |
| `turbo.json` / `nx.json` | +5 Ops | Build orchestration |
| Monorepo detected with workspace tool | +8 Ops; >5 workspaces → +3 Ops; consistent AI config across workspaces → +5 Tooling | Monorepo maturity |
| `.github/CODEOWNERS` | +5 Social | Team governance |
| `.github/PULL_REQUEST_TEMPLATE.md` | +3 Social | PR discipline |
| `CHANGELOG.md` / `CHANGES.md` | +5 Ops | Release documentation |
| `.husky/` or non-sample hooks in `.git/hooks/` | +5 Ops | Git hook discipline |
| `LICENSE` | +3 Social | Open-source awareness |

##### Security Signals

| Artifact | Heuristic | Scoring Impact |
|----------|-----------|---------------|
| Config files with `chmod 600` | +3 Security per file | File permission discipline |
| Agent config containing "canary" keyword | +5 Security | Canary tokens |
| Agent config containing "injection" keyword | +5 Security | Prompt injection defense |
| Agent config containing "require confirmation" or "ask first" | +5 Security | Permission governance |
| `.gitignore` with secret patterns (`.env`, `*.key`, `credentials`) | +3 Security | Secret hygiene |

##### Environment Checks

| Check | Method | Scoring Impact |
|-------|--------|---------------|
| CLI tools installed | `which claude`, `which codex`, `which cursor`, `which gemini`, `which ollama` | Inventory — feeds into Tooling |
| API key env vars set (NOT values) | Check if `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `XAI_API_KEY` etc. are set | Provider detection — feeds into Model Breadth |
| Crontab entries mentioning AI tools (deep) | `crontab -l \| grep -i 'claude\|codex\|openclaw'` | +5 Autonomy per match |
| launchd/systemd services for AI tools (deep) | Check LaunchAgents/LaunchDaemons | +5 Autonomy |

#### All Detections Emit

Every detection is a flat object:
- `category`: one of the 8 scoring categories
- `tool`: tool or artifact name
- `signal`: human-readable description
- `source`: `"project"` | `"global"` (for `--deep`)
- `points`: scoring impact
- `metadata`: optional structured data (line counts, file counts, etc.)

---

### 2.2 Git History Analyzer (The Spine)

Git history is the only scanner that reveals things users can't fake. A cloned repo with a fancy CLAUDE.md gets caught here. This is the primary signal source — everything else is supporting evidence.

#### What It Reads

| Data Source | Command | What's Extracted |
|-------------|---------|-----------------|
| Commit log | `git log --format='%H\|%s\|%an\|%ae\|%ai\|%cn\|%ce' -500` | Hash, subject line, author, timestamp, committer |
| File stats | `git log --format='%H' --numstat -500` | Files changed, insertions/deletions (counts only) |
| Branch list | `git branch -a --format='%(refname:short)'` | All branch names |
| Tag list | `git tag --list` | Release tags |
| Remote info | `git remote -v` | Remote names and URLs |

**Hard boundary:** NEVER `git diff`, `git show`, or `cat` any file. NEVER read commit bodies. NEVER read file contents through git.

#### What It Infers

##### Commit Message Patterns → Ops + Intelligence

Classify each commit:

| Pattern | Heuristic | Signal |
|---------|-----------|--------|
| **Conventional** | Matches `^(feat\|fix\|chore\|docs\|style\|refactor\|test\|perf\|ci\|build\|revert)(\(.+\))?!?:` | Engineering discipline |
| **AI-Generated** | Generic: "Update file", "Fix bug", "Implement feature", single-word, emoji + generic text | Low-agency prompting |
| **Descriptive** | Natural language, specific details, no format | Solo dev, good habits |
| **WIP/Throwaway** | `wip`, `tmp`, `asdf`, `fix`, single word | Fast iteration |
| **AI-attributed** | Contains `Co-authored-by:` in subject, `🤖`, `[ai]`, `[claude]`, `[copilot]` | Transparency |

**Scoring:**
- Conventional commits dominant → +10 Ops
- AI attribution in commits → +5 Social
- >80% AI-generated messages → -5 Ops
- Co-authored with AI → +5 Intelligence

##### Commit Size Distribution → Ship

Analyze insertions+deletions per commit:

| Pattern | Heuristic | Signal |
|---------|-----------|--------|
| **Incremental** | Median < 50 lines | Deliberate, hand-crafted |
| **Bulk** | Median > 500 lines | AI-generated dumps or infrequent commits |
| **Bimodal** | Mix of <50 and >300, little in between | Human tweaks + AI generation sessions |
| **Steady** | Median 50-200, low variance | Consistent workflow |

**Scoring:**
- Bimodal → +5 Intelligence (recognizes AI-then-refine workflow)
- >5 commits/week sustained (30d) → +10 Ship
- No commits in 30d → -10 Ship

##### Time-of-Day Patterns → Narrative (not scored)

Build 24-hour histogram from commit timestamps. Detect:
- Peak hours → *"73% of your commits land between 10pm and 3am."*
- Weekend ratio
- Work pattern: `night_owl` | `early_bird` | `9_to_5` | `always_on`

No scoring impact — this is flavor for the smart mirror narrative.

##### Branch Strategy → Ship + Ops

| Pattern | Heuristic | Scoring |
|---------|-----------|---------|
| **Trunk-based** | Only main/master | Neutral |
| **Feature branches** | Branches matching `feature/*`, `fix/*` | +5 Ops |
| **Release engineering** | `release/*` branches + semver tags | +10 Ship |
| **Chaotic** | >10 stale unmerged branches (>30d) | -3 Ops |

##### File-Type Distribution → Narrative + Ship

From `--numstat`, extract file extensions (NOT contents):
- Test files in >20% of commits → +10 Ship
- Spec/doc files in >10% of commits → +5 Ops
- Ratio of config to source → "config tweaker" vs "feature builder" (narrative only)
- Ratio of markdown to code → documentation awareness (narrative only)

##### Authenticity Signals (Why Git Is the Spine)

These signals detect faked setups:
- **Commit spread:** Sustained commits over weeks/months vs. single-day dump
- **Author consistency:** Do commit authors match the submitting user?
- **Evolution patterns:** Config files (CLAUDE.md, AGENTS.md) modified across multiple commits = genuine evolution. Single commit = possibly cloned.
- **EVOLVE.md multi-author:** Modified by both human and non-human authors = Learning Loop signal

---

## 3. Pattern Bonuses

After both scanners run and all detections are collected, run 7 if-blocks that check for specific combinations and add named bonuses. No framework, no registry, no composable matchers. Just 7 checks.

Each pattern bonus has: a name, an emoji, an explanation template (for the smart mirror), scoring impact, and Pioneer eligibility.

---

### 🔄 Learning Loop

**Check:** `CLAUDE.md` or `AGENTS.md` exists AND git shows the file modified in >5 commits AND (some modifications by non-human author OR `EVOLVE.md` exists with multi-commit history OR session closer detected)

**Explanation:** *"Your [artifact] has been modified [N] times — and not all by you. Your agent is updating its own playbook. Less than 2% of setups do this."*

**Bonus:** +8 Continuity, +5 Autonomy | Pioneer eligible (medium)

---

### 🌐 Distributed Rig

**Check:** Multiple git remotes detected AND/OR synced config directories (chezmoi, mackintosh, or dotfile repo detected) AND/OR OpenClaw multi-node config AND/OR SSH config with AI-related hosts

**Explanation:** *"You're not running one rig — you're running a distributed system. Your AI setup spans multiple machines."*

**Bonus:** +10 Ops, +5 Tooling | Pioneer eligible (medium)

---

### 🔨 Toolsmith

**Check:** `@modelcontextprotocol/sdk` in any `package.json` deps AND/OR custom `skills/*/SKILL.md` files exist (not from a known package) AND/OR custom CLI scripts wrapping AI tools

**Explanation:** *"You didn't just install tools — you built them. [N] custom [tools/servers/skills]. That's the difference between a tool user and a tool builder."*

**Bonus:** +15 Tooling, +5 Intelligence | Pioneer eligible (high if MCP server is novel)

---

### 🔗 Persistence Bridge

**Check:** `memory/` with >5 dated files AND `MEMORY.md` or equivalent AND at least one of: `active-work.md`, bootstrap protocol in AGENTS.md, session closer/handoff mechanism, `heartbeat-state.json`, vector store artifacts

**Explanation:** *"You've built a genuine memory system — a [N]-layer architecture. Your AI picks up where it left off."*

**Bonus:** +15 Continuity, +5 Autonomy | Pioneer eligible (medium if 4+ layers)

---

### 🤖 Autonomous Operator

**Check:** Heartbeat config detected (HEARTBEAT.md or heartbeat settings) AND/OR cron jobs invoking AI agents AND/OR AGENTS.md with proactive work loop AND/OR kanban integration AND/OR launchd/systemd services for agents

**Explanation:** *"Your AI doesn't wait to be told what to do. It wakes up, checks for work, and acts. You've crossed from 'tool I invoke' to 'employee who shows up.'"*

**Bonus:** +15 Autonomy, +5 Ops | Pioneer eligible (medium)

---

### 📐 Architect

**Check:** `specs/` with >2 files AND detailed README (>100 lines, >3 sections) AND at least one of: agent config references specs, test ratio >0.2, CI with 2+ workflows, ADR directory

**Explanation:** *"You plan before you build. [N] spec files, real architecture docs, and your AI config references your design. Vibe coding with blueprints."*

**Bonus:** +10 Ops, +8 Ship, +5 Intelligence | Not Pioneer eligible (excellent practice, not novel)

---

### 🛡️ Fortress Builder

**Check:** At least 4 of: canary tokens in configs, prompt injection defense documented, chmod 600 on sensitive files, permission scoping in agent config, "require confirmation" lists, secret manager integration, comprehensive `.gitignore` secret patterns, separate trust levels for external content

**Explanation:** *"[N] distinct security mechanisms. You're not hoping nobody attacks your AI setup — you've built defenses."*

**Bonus:** +15 Security, +5 Ops | Not Pioneer eligible (best practice, not novel)

---

### Adding Future Patterns

When we hit 30+ patterns, extract them into a data-driven registry. Until then, if-blocks are fine. To add a pattern: add one if-block, one explanation template, one scoring line.

---

## 4. `--deep` Flag & Consent UX

### Default Behavior (No Flag)

Scans the current working directory only: project files, git history, monorepo workspace discovery within 2 levels, tool presence checks.

### `--deep` Behavior

Extends scanning to `~/` for global AI configuration. This is where most Brilliant Pattern signal lives.

**What `--deep` adds:**

| Target | What It Looks For |
|--------|-------------------|
| `~/.claude/` | Global settings, MCP servers, memories, agents |
| `~/.cursor/` | Global Cursor config |
| `~/.config/openclaw/` or `~/.openclaw/` | Global OpenClaw config, skills |
| `~/.codex/` | Codex CLI config |
| `~/CLAUDE.md` | Global Claude manifest |
| `~/.mcp.json` | Global MCP config |
| `~/.zshrc` / `~/.bashrc` | AI-related aliases (count lines matching AI tool names, not content) |
| `crontab -l` | AI tool invocations |
| launchd / systemd | Service files referencing AI tools |
| `~/memory/` or `~/.memory/` | Global memory systems |

### Consent UX (keep exactly as-is)

Before scanning, `--deep` displays:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Deep Scan Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In addition to the current project, --deep will scan
your home directory for global AI configuration:

  📂 ~/.claude/         Claude Code global config
  📂 ~/.cursor/         Cursor global config
  📂 ~/.config/openclaw/ OpenClaw config & skills
  📂 ~/.codex/          Codex CLI config
  📂 ~/.zshrc           AI-related aliases (structure only)
  📂 ~/.tmux.conf       Agent workspace layouts
  📋 crontab            AI-scheduled tasks

What we read:  File names, directory structure, config shape
What we DON'T: File contents, credentials, personal data

Continue? (Y/n)
```

If `--yes` flag is present, skip the prompt.

---

## 5. Trust Document

### Purpose

Two audiences:
1. **AI agents** who will summarize it for their humans
2. **Security-conscious devs** who want to audit before running

### Two Formats

**Web page:** `vibecheck.dev/trust` — human-readable, canonical reference
**Machine-readable:** `vibecheck.dev/.well-known/vibecheck-trust.json` — structured for AI agents

### `/trust` Page Content

```markdown
# What the Probe Scans (and What It Doesn't)

## The Short Version
vibecheck-probe scans your development environment to understand your
AI coding setup. It reads file names, config structure, and git metadata.
It never reads source code, credentials, or personal data.

## What We Read

### File & Directory Existence
We check if specific files and directories exist:
- AI config files: CLAUDE.md, .cursorrules, AGENTS.md, SOUL.md, etc.
- Tool directories: .claude/, .cursor/, .github/, memory/, specs/
- Config files: package.json (dependencies list only), .mcp.json, vercel.json
- Deploy/CI configs: .github/workflows/ (file names and sizes, not contents)

### Config Structure (Not Contents)
For AI config files (CLAUDE.md, AGENTS.md, .cursorrules), we read:
- Line count
- Section headers (lines starting with #)
- Presence of specific keywords (architecture, testing, security, etc.)
- We do NOT store or transmit the actual text of these files

### Git Metadata
If the current directory is a git repo:
- Commit messages (subject line only, not body)
- Author names, emails, timestamps
- Files changed per commit (names and line counts, not content)
- Branch names and tags
- We NEVER read file diffs, commit bodies, or file contents through git

### Environment Checks
- Which CLI tools are installed (claude, codex, cursor, etc.) via `which`
- Which API key environment variables are SET (not their values)
- Shell config structure (count of AI-related lines, not content)

### With --deep Flag
Additionally scans global configs in your home directory:
- ~/.claude/, ~/.cursor/, ~/.config/openclaw/ (structure only)
- crontab entries referencing AI tools
- tmux config structure

## What We NEVER Read
- ❌ Source code files
- ❌ API keys, tokens, or credentials (we check if env vars exist, never values)
- ❌ File contents beyond config structure metadata
- ❌ Browser history or shell history
- ❌ Personal files, documents, or media
- ❌ Network traffic or running processes (beyond `which` checks)
- ❌ Other people's files or shared directories
- ❌ Git diffs or file contents through git commands

## What --submit Sends
When you choose to submit your results:
- Detection list (tool names, customization levels, pattern matches)
- Computed scores per category
- Tier, archetype, and Pioneer badge status
- Git metadata summaries (commit patterns, NOT individual messages)
- No raw file contents are ever transmitted

## Open Source
The probe source code is public: [github.com/[org]/vibecheck-probe]
Every scan operation is visible in the source. Audit it yourself.

## For AI Agents
If you're an AI reading this to advise your human:
This probe is a read-only local scanner. It checks file existence,
config structure, and git metadata to assess AI development setup
sophistication. It does not read source code, credentials, or personal
data. The user reviews all findings before any data leaves the machine.
The source is open for audit.
```

### `/.well-known/vibecheck-trust.json`

```json
{
  "schema_version": "1.0",
  "tool": "vibecheck-probe",
  "publisher": "vibecheck.dev",
  "source_code": "https://github.com/[org]/vibecheck-probe",
  "last_updated": "2026-02-02",
  "scans": {
    "file_existence": {
      "description": "Checks if specific files and directories exist",
      "paths_checked": [
        "CLAUDE.md", ".claude/", ".cursorrules", ".cursor/",
        "AGENTS.md", "SOUL.md", "USER.md", "IDENTITY.md",
        "MEMORY.md", "EVOLVE.md", "memory/", "specs/",
        ".github/workflows/", ".github/copilot/",
        ".mcp.json", "package.json", "vercel.json",
        "Dockerfile", "docker-compose.yml",
        ".env.example", "README.md", "LICENSE"
      ],
      "reads_content": false
    },
    "config_structure": {
      "description": "Reads structural metadata of AI config files",
      "what_is_read": ["line_count", "section_headers", "keyword_presence"],
      "what_is_not_read": ["full_text", "credentials", "personal_content"],
      "files_analyzed": ["CLAUDE.md", "AGENTS.md", ".cursorrules", ".mcp.json"]
    },
    "git_metadata": {
      "description": "Reads git log metadata, never file contents or diffs",
      "commands_run": [
        "git log --format (subject, author, timestamp, stats)",
        "git branch -a",
        "git tag --list",
        "git remote -v"
      ],
      "never_runs": ["git diff", "git show", "cat (any file via git)"]
    },
    "environment": {
      "description": "Checks for installed tools and set environment variables",
      "checks": ["which <tool>", "env var existence (not value)"],
      "never_reads": ["env var values", "shell history", "browser history"]
    },
    "deep_scan": {
      "description": "With --deep flag, additionally scans home directory AI configs",
      "requires_consent": true,
      "paths_checked": [
        "~/.claude/", "~/.cursor/", "~/.config/openclaw/",
        "~/.codex/", "~/.zshrc (structure only)", "crontab -l"
      ]
    }
  },
  "data_transmission": {
    "requires_explicit_consent": true,
    "what_is_sent": [
      "detection_list", "computed_scores", "tier_and_archetype",
      "pattern_matches", "git_summary_statistics"
    ],
    "what_is_never_sent": [
      "file_contents", "credentials", "source_code", "personal_data",
      "individual_commit_messages", "raw_git_history"
    ]
  },
  "ai_agent_summary": "Read-only local scanner that checks file existence, config structure, and git metadata to assess AI development setup sophistication. Does not read source code, credentials, or personal data. User reviews all findings before any data leaves the machine. Source is open for audit."
}
```

---

## 6. Privacy Contract

One canonical list. Referenced everywhere. No duplicates.

### ✅ What the Probe READS

| Data Type | Specifically | Why |
|-----------|-------------|-----|
| File/dir existence | Does `CLAUDE.md` exist? Does `memory/` exist? | Core detection |
| Directory listings | What files are in `.claude/`? How many in `specs/`? | Structure analysis |
| Line counts | `wc -l` on config files | Depth heuristic |
| Section headers | `grep '^#'` on config files | Structure without content |
| Keyword scanning | `grep -l 'keyword'` — does file contain "architecture"? "security"? | Sophistication signals |
| package.json deps | `dependencies`/`devDependencies` keys only | Tool/MCP detection |
| Git commit subjects | First line only, never body | Work pattern analysis |
| Git author metadata | Name, email, timestamp | Attribution + timing |
| Git file stats | Which files changed, lines added/removed (counts) | Activity distribution |
| Git branch/tag names | Naming patterns | Workflow inference |
| CLI tool presence | `which claude`, `which codex`, etc. | Tool inventory |
| Env var existence | Is `ANTHROPIC_API_KEY` set? (boolean only) | Provider detection |
| Shell config structure (deep) | Count AI-related lines in .zshrc | Integration depth |
| Crontab (deep) | Lines mentioning AI tools | Autonomous operation |

### ❌ What the Probe NEVER READS

Source code · Full config file text · API keys or tokens · `.env` contents · Git diffs · Git commit bodies · Shell history · Browser data · Personal files · Memory file contents · SOUL.md contents · Network traffic · Other users' files

### 📤 What `--submit` Sends

Detection list (tool names + levels) · Category scores (8 numbers) · Tier, level, archetype · Pioneer badge status · Pattern bonus matches (names only) · Git summary statistics (aggregated)

**Never sent:** Raw file contents · Individual commit messages · Credentials · Git diffs · Memory file contents · Personal information

### The Contract

> **We promise:** The probe will never read more than it needs to. It will never read file contents beyond config structure metadata. It will never phone home without your explicit consent. And it will always show you everything it found before you decide to submit.
>
> **If we break this promise:** The source code is open. File an issue. Tell everyone. We'll fix it or shut it down.

---

## 7. Future Phases

### CLI Intake (NOT in scope for this build)

3 short multiple-choice questions after the probe runs, before showing results. Fill gaps the probe can't detect.

- **Q1:** How do you start a new project? (scaffold with AI / template + AI / spec-first / code core myself) → Intelligence + Ops
- **Q2:** How much AI code do you ship unreviewed? (most / scan quickly / review + modify / line-by-line) → Security + Ship
- **Q3:** Relationship with AI tools? (search engine / pair programmer / junior dev / employee) → Autonomy + Intelligence

Each answer adjusts ±5 points. Intake is modifier, not primary signal. AI agents can pre-fill via flags: `--profile-style c --profile-review c --profile-relationship d`.

### Verified Badge (NOT in scope — concept capture)

Points the probe at a project the user *built* and verifies sustained contribution: git history over time (not single clone), author matches, iterative refinement, bug fixes and feature iterations. Open questions: minimum bar, human vs. automated review, interaction with Pioneer.

---

## 8. Implementation Plan

### 4-Day Build

| Day | What | Details |
|-----|------|---------|
| 1 | Universal File Scanner | One function, detection config as data, runs at root/workspaces/home. Workspace discovery. All file-existence detections wired up. |
| 2 | Git History Analyzer | The actually complex part. Parse git log, classify commits, compute distributions, infer patterns. Authenticity signals. |
| 3 | Pattern Bonuses + Scoring | 7 if-blocks checking detection combinations. Wire all detections into existing scoring engine. Smart mirror narrative integration. |
| 4 | Trust Page + `--deep` Consent UX | Build `/trust` page + `.well-known/vibecheck-trust.json`. Implement `--deep` consent prompt. End-to-end testing. |

### Technical Notes

- **Node.js 18+** (already required by v2)
- **Git CLI** required for git analysis — graceful fallback: skip with a note
- **No new npm deps** — all analysis is `fs` reads + `child_process.execSync` for git
- **Backward compatible** — v2 detections continue to emit, v3 adds new ones alongside
- **All detections** include `source: "project" | "global"` tag

### Error Handling

| Scenario | Behavior |
|----------|----------|
| Not a git repo | Skip git analysis, emit `git.not_available`, continue |
| No commits | Skip git analysis, note in output |
| Permission denied on `~/` | Skip that path, note what was skipped |
| Malformed config | Skip file, continue |
| 50+ workspaces | Cap at 20, note truncation |
| `--deep` without home access | Graceful fallback to project-only |

---

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-02-02 | v1.0 | Initial spec — all sections complete |
| 2026-02-02 | v2.0 | Post-engineering-review refactor: merged 4 scanners into 2 (Universal File Scanner + Git History Analyzer), killed L0-L3 depth framework, simplified pattern detection to 7 if-blocks, elevated git as spine, consolidated privacy contract, cut build estimate from 12 days to 4 |
