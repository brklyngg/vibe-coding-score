# PRD: Vibe Coder Score

**Author:** Gary Gurevich & Jerome
**Date:** 2026-02-01
**Status:** Draft v2.4 (Claude Code ready)
**Last Updated:** 2026-02-01

---

## Elevator Pitch

LinkedIn just launched "vibe coding credentials" with Lovable, Replit, and Relay.app. Lovable's credential is literally a message counter — send more prompts, get a higher badge. That's not assessment. That's a participation trophy from a single platform.

**Vibe Coder Score is the real thing.** Run `npx vibecheck-probe` and get a deep, cross-platform analysis of your actual coding setup — every AI model, MCP server, agent config, CLAUDE.md, memory system, and deploy pipeline you're running. The probe reads your repos, parses your agent configs, classifies your tools against a comprehensive taxonomy, and highlights innovations that are ahead of the curve.

You get a tier title (Observer → Industrialist), a level score (0–100), a 4-letter personality type (e.g., "Level 47 Operator · MARD"), a radar chart across 8 capability categories, and a beautiful shareable card with a tagline that captures your vibe. Build something genuinely novel? You earn the coveted **Pioneer badge** 🏔️ — a prestige modifier awarded at any level that signals real innovation.

The serious builders — the ones running Claude Code CLI, managing multi-agent workflows, writing sophisticated CLAUDE.md files, orchestrating MCP servers — aren't building on Lovable. They're building in the terminal. No existing credential can see what they're doing. We can.

---

## 1. Problem Statement

### What pain are we solving?

The vibe coding revolution created a new class of builder: people who aren't professional software engineers by training but are now shipping real software with AI tools like Cursor, Claude Code, and OpenClaw. Collins Dictionary named "vibe coding" its 2025 Word of the Year. 92% of US developers use AI tools daily. 25% of YC W25 startups have 95%+ AI-generated codebases.

The beauty and weirdness of this moment is that everybody's coding setup is **bespoke.** It's steampunk — cobbled together from different AI models, MCP servers, CLI tools, memory systems, deploy pipelines. No two setups look alike. There's extraordinary innovation happening in garages and apartments, but no way to assess it.

People want to know: *Am I actually good at this? Is my setup legit? What am I missing?* And eventually — *how do I stack up against my peers?*

Right now there's no framework. No way to say "I'm a builder who is organized, productive, ships great UX, builds with users in mind, builds securely, builds efficiently" — except in paragraph-long tweets that nobody trusts.

### How are people solving this today?

| Current Approach | Pros | Cons |
|---|---|---|
| Twitter bio + threads | Free, expressive | Unstructured, no comparability, no credibility |
| GitHub profile / contribution graph | Data-backed | Measures commits, not AI sophistication |
| "I use Cursor" as identity shorthand | Simple signal | Reductive — tool ≠ workflow ≠ capability |
| LinkedIn — listing skills, experience, portfolio | Professional context | Self-reported, no verification, no standardization |
| HackerRank / Codility / LeetCode | Rigorous, employer-trusted | Built for traditional hiring. Tests algorithms, not AI-native building. Zero fun |
| Nothing — just vibes | Easy | Exactly the problem |

### Why now?

1. **The term "vibe coding" went mainstream in 2025.** Andrej Karpathy coined it, Collins Dictionary crowned it, and r/vibecoding has an active community + Discord (4,100+ members). Cultural moment is real.

2. **NPM became a distribution platform.** Claude Code, Gemini CLI, and the entire MCP ecosystem ship via npm/npx. Running `npx <thing>` isn't a novel UX pattern — it's the expected one.

3. **LinkedIn just validated the category.** On January 28, 2026, LinkedIn launched "vibe coding credentials" in partnership with Lovable, Replit, Relay.app, and Descript — with GitHub and Zapier integrations coming. This proves employer demand and user appetite for AI coding credentials. But every existing implementation is shallow and platform-specific (see Competitive Landscape).

4. **The serious builders have no credential.** The people doing the deepest AI-native work — multi-agent CLI workflows, custom CLAUDE.md configs, MCP ecosystems, orchestrators — are invisible to LinkedIn's platform-specific badges. Enterprise-grade work is being built in Claude Code CLI, not Lovable. Nobody is credentialing that tier of builder.

---

## 2. Value Proposition (v1)

Vibe Coder Score v1 is a **smart mirror** — not a leaderboard. It delivers three things:

1. **Understand your setup.** A thoughtful, automated analysis of your AI coding environment. What models you run, how your agents are configured, what MCP servers you have, how your deploy pipeline works, what your security posture looks like. Most people don't have a clear picture of their own stack — we give them one.

2. **See where you shine.** Your tools are classified against a known taxonomy of AI-native development patterns. The scoring engine identifies your strengths across 8 categories and assigns you an archetype that captures your style.

3. **Learn what's missing.** The analysis highlights gaps — maybe you have no memory persistence, or your security is weak, or you're missing MCP servers that would 10x your workflow. Actionable, specific feedback.

**Future (post-200 users):** Once we have enough assessments, the mirror gains the ability to provide **relative scoring** — how you compare to peers. But the v1 value is the analysis itself.

---

## 3. Target Users

### Primary Persona

**Sam, 32, "Idea Person Turned Builder"**

- **Background:** Product manager / designer / entrepreneur. Not a CS grad. Started coding seriously 8 months ago when AI tools made it possible. Uses Cursor daily, recently discovered Claude Code CLI. Has shipped 2 side projects on Vercel.
- **Mindset:** Excited and slightly insecure. Knows they're building real things but wonders if they're doing it "right." Sees experienced devs on Twitter and feels imposter syndrome.
- **Goal:** Wants an honest assessment of their setup. Wants to know what they're doing well and what they should add. Wants something shareable that captures their identity as a builder.
- **Pain:** No way to get objective feedback on their AI coding setup. Existing assessments (LeetCode, HackerRank) test skills they don't have and don't need.
- **Behavior:** Active on Twitter. Shares wins. Would absolutely post a score card if it made them look good — and would use the feedback to level up if it didn't.
- **Willingness to pay:** $0 for the assessment. $9–15/mo for detailed breakdowns, historical tracking, and embeddable badges once they see the value.

### Secondary Persona

**Dana, 35, Senior Engineer at a Startup**

- **Background:** 10+ years experience. Uses Copilot and sometimes Claude. Has opinions about AI code quality. Follows the discourse but doesn't post much.
- **Goal:** Curious where she falls on the spectrum. Wants to see if the assessment is legit or just another quiz.
- **Pain:** Most "developer type" quizzes are shallow BuzzFeed nonsense. She wants something that actually reads her environment and tells her something she doesn't already know.

### Who is this NOT for?

- **Enterprise teams looking for hiring assessments.** This isn't Codility.
- **Non-technical users / pure no-coders.** If you can't run a terminal command, the core experience won't land. (V2 might expand.)
- **People who hate AI coding.** They exist, they're valid, they're not our audience.

---

## 4. User Journeys

### Journey: First-Time User (Discovery → Share)

1. **Discovery:** Sam sees a friend's Vibe Coder Score card on Twitter. It shows **"THE OPERATOR"** big and bold, with "Level 47 · MGRD" beneath it, and the tagline *"You stop typing syntax. You become a manager."* Clean dark-mode card, radar chart, vibecheck.dev/@friend URL. He thinks "what's mine?"

2. **Landing page:** He visits vibecheck.dev. Clean hero: "How good is your AI coding setup?" with a CTA: "Get your vibe check." Below: sample cards from each tier — Observer through Industrialist — each with its tagline and a different archetype code. The tier titles sell the aspiration.

3. **Sign in with X:** One-click OAuth. While auth happens, we scan his public profile — bio keywords, who he follows, recent tweets about AI tools. This seeds Layer 1 scoring. Takes <2 seconds.

4. **The Probe:** The site shows: "Now run this in your terminal:" with a copyable `npx vibecheck-probe` command. He copies, pastes, hits enter. The probe runs locally for 10–15 seconds, scanning:
   - **Environment:** AI models configured, MCP servers installed, CLI tools available, shell setup
   - **Repos:** Greps local git repos for CLAUDE.md, EVOLVE.md, .cursorrules, agent configs, CI/CD pipelines, deploy configs
   - **Configs:** Reads agent configuration files (OpenClaw's config, Claude Code settings, Cursor rules) to understand how the user has configured their AI tools
   - **Security:** File permissions, secret storage patterns, sandboxing

   It outputs a colorful terminal summary of everything detected. At the bottom: "Submit to vibecheck.dev? (Y/n)" — the user sees exactly what's being sent. He hits Y.

5. **5 Quick Questions:** Back on the site, 5 questions appear (probe data already incorporated). Slider/multiple-choice, takes 90 seconds. "How do you start a new project?" "How much AI output do you review?" "How many projects shipped with AI in the last 6 months?"

6. **The Reveal:** Full-screen card generation animation (2–3 seconds). His tier title appears first — big, bold: **"THE BUILDER."** Then the details fill in: Level 38 · MARD. The tagline fades in beneath: *"The AI becomes a partner."* Card shows radar chart across 8 capabilities, archetype description, and a breakdown of detected tools classified by category — plus any innovations flagged as "ahead of the curve." It reads positive and aspirational — every tier is cool.

7. **Share:** One-click "Share to X" button pre-fills a tweet with the card image + his vibecheck.dev profile URL. He posts it. His followers see it. The loop restarts.

**Time from click to share: ~4 minutes.**

### Journey: Return User (Level Up)

1. Sam runs `npx vibecheck-probe` again 3 months later after adding MCP servers and improving his security setup.
2. His score updates. He gets a diff of what changed.
3. New card generated. He shares again. The progression is the story.

### First-Time User Experience (Critical)

| Step | Target Time | Friction |
|---|---|---|
| Discovery (see a card) | 0s (organic) | None |
| Visit landing page | 5s to understand | None |
| X OAuth sign-in | 10s | Low (one click) |
| Copy/run npx probe | 30s | Medium — key friction point |
| Review + submit probe | 15s | Low |
| Answer 5 questions | 90s | Low |
| See results + share | 10s | None |
| **Total** | **~4 min** | Probe is the key friction point |

⚡ **Time to value: Under 5 minutes.** Aha moment: seeing your type + a thoughtful breakdown of your actual setup.

---

## 5. Competitive Landscape

### The New LinkedIn Credential Ecosystem (launched Jan 28, 2026)

LinkedIn now allows users to display AI/vibe coding credentials in their "Licenses & Certifications" section, backed by partner platforms. This validates the category but exposes a massive gap:

| LinkedIn Partner | What They Measure | Credential Format | Fatal Flaw |
|---|---|---|---|
| **Lovable** | Number of prompts sent on Lovable | Bronze → Silver → Gold → Platinum → Diamond | Pure usage counter. More messages ≠ better coder. Platform-specific |
| **Replit** | Activity level on Replit | Numerical levels | Platform-specific. Measures Replit usage, not coding sophistication |
| **Relay.app** | Automation building on Relay | Beginner / Intermediate / Advanced "AI Agent Builder" | Narrow scope. One platform's view of one skill |
| **Descript** | Video/audio editing with AI | TBD | Not even coding — it's media editing |

**Coming soon:** GitHub, Zapier, Gamma integrations.

**The pattern:** Every credential is platform-locked, usage-based, and shallow. They measure *how much* you use one tool, not *how well* your overall setup works. No one is assessing cross-platform sophistication, agent configuration quality, MCP ecosystem depth, or security posture.

**The gap we fill:** Enterprise-grade AI-native work isn't happening on Lovable. It's happening in Claude Code CLI, with CLAUDE.md files, MCP servers, multi-agent orchestration, and custom deploy pipelines. Nobody can see that work — until now.

### Traditional Competitors

| Competitor | What They Do | Strength | Weakness | Our Angle |
|---|---|---|---|---|
| 16Personalities | MBTI-style personality quiz | Gold standard UX, 1B+ tests taken | Generic — not developer-specific. Self-reported only | We scan your actual environment. Real data, not self-perception |
| GitHub Wrapped / Git Wrapped | Year-in-review for GitHub activity | Fun, shareable | Measures commits/languages, not AI workflow sophistication | We measure how you build with AI, not what you committed |
| HackerRank / Codility / LeetCode | Developer skill assessment | Rigorous, employer-trusted | Built for traditional CS hiring. Zero shareability | We assess AI-native building, and we're fun to share |
| StackShare | "What's your tech stack?" | Good data on tool adoption | Stale energy, not identity-focused | We're identity + capability, not just inventory |

### Our Unique Position

We're the **only product** that provides a **cross-platform, depth-based assessment** of an AI-native builder's setup:
- **Deep environment scanning** (the probe reads your actual setup, repos, agent configs, CLAUDE.md files — not just usage counters)
- **Tool taxonomy classification** (your tools mapped against the known landscape of AI-native dev patterns, including what's novel)
- **CLI-native audience** (we serve the builders doing serious work in the terminal — the tier that LinkedIn's platform partners can't reach)
- **Innovation spotting** (highlights what's ahead of the curve — custom MCP servers, novel agent patterns, orchestration configs)
- **Personality typing + shareability** (you get an identity artifact, not just a badge level)

---

## 6. Core Features

### Must Have (MVP — v1)

| # | Feature | Description | Why It's Essential |
|---|---|---|---|
| 1 | X OAuth sign-in + Layer 1 scan | Sign in with Twitter, auto-detect tool signals from public profile | Zero-friction entry. Social identity is the sharing mechanism |
| 2 | npx probe script | Local scanner: models, tools, MCPs, memory systems, deploy pipeline, security posture. **Greps repos for CLAUDE.md, EVOLVE.md, .cursorrules, agent configs.** Reads config files to understand AI tool setup depth | This IS the product. Automated detection is the innovation |
| 3 | Tool taxonomy engine | Classifies detected tools against a known taxonomy of AI-native dev patterns. Flags innovations outside the known zoology — things the taxonomy hasn't seen yet. Innovation flags feed into **Pioneer badge** eligibility | The "smart mirror" — shows users their setup in context. Highlights what's standard, what's advanced, what's novel. Pioneer badge creates a "gold rush" dynamic |
| 4 | 5-question intake | Short questionnaire: workflow, philosophy, speed — things the probe can't detect | Fills gaps. Captures intent and approach |
| 5 | Scoring engine | Weighted scoring across 8 categories → level (0–100) + 4-letter type assignment | Core IP. Turns signals into a meaningful assessment |
| 6 | Shareable card (Satori) | Dark-mode card with **Tier Title** (large, most prominent) + **Level Number** + **Archetype Code** (smaller) + **Tagline** (italic subtitle) + radar chart → rendered to PNG. **Pioneer badge earners** get gold/iridescent border + 🏔️ icon + innovation callout. Card hierarchy: `THE OPERATOR` → `Level 47 · MARD` → *"You stop typing syntax. You become a manager."* | The viral artifact. Without a beautiful card, nobody shares. Tier titles + taglines give every card personality and shareability. Pioneer cards are visually distinct — the most shareable variant |
| 7 | Profile page | vibecheck.dev/@handle — permanent URL showing your type, score, and tool breakdown | Shareable link for bios and signatures |
| 8 | One-click X share | Pre-filled tweet with card image + profile URL | Removes friction from the viral loop |

### Should Have (v1.1 — 2–4 weeks post-launch)

| # | Feature | Description |
|---|---|---|
| 1 | GitHub OAuth + repo scanning | Detect CLAUDE.md files, CI configs, AI-authored commit patterns remotely. "GitHub Verified" badge |
| 2 | ASCII art terminal output | Fun ASCII version of your type card in the terminal |
| 3 | Re-assessment / level tracking | Run the probe again, see your score change over time. Growth mechanic |
| 4 | Archetype detail pages | Rich descriptions per type: strengths, blindspots, recommended tools, improvement paths |
| 5 | Percentile ranking | "Top 15% of vibe coders" — once we have 200+ users for meaningful comparison |

### Could Have (v2+)

| # | Feature | Trigger to Build |
|---|---|---|
| 1 | LinkedIn credential partnership | After v1 traction. LinkedIn is actively onboarding partners (Lovable, Replit, GitHub, Zapier already in). We'd be the first cross-platform, depth-based credential — differentiated from usage counters. Apply to LinkedIn's partner program once we have 500+ assessments |
| 2 | Paid tier (breakdowns, badges, embeds) | When >1,000 users |
| 3 | Team comparisons | When inbound from teams/companies |
| 4 | Coding assignment (verified badge) | When anti-gaming matters |
| 5 | Leaderboard (opt-in) | Only if community requests it |

### Won't Have (Explicitly Out of Scope for v1)

| Feature | Why Not |
|---|---|
| Coding assignment | Adds friction. Probe + repo analysis provides enough signal for v1. Defer until anti-gaming matters |
| Percentile ranking | Meaningless with <200 users. Ship the mirror first, add comparison later |
| LinkedIn credential integration | LinkedIn's partner ecosystem is live and growing — but we need v1 traction first. Users can manually add their Vibe Coder Score to LinkedIn's "Licenses & Certifications" with their profile URL. Official partnership comes in v2 |
| Public leaderboard | Creates anxiety, discourages low-scorers from sharing |
| AI-generated avatar art | Scope creep. CSS color palettes per archetype are cleaner |
| Mobile app | Web + CLI is sufficient |

---

## 6.5 The Voice — Audio-Inspired UX Tone

The NotebookLM audio overview of the taxonomy ("Vibe Coder Score vs LinkedIn Participation Trophies") established the canonical voice for all user-facing output. Gary validated this as "pretty great" — it's the voice of the smart mirror, the shareable card, and all probe output.

**The voice is:** Warm, specific, slightly irreverent, deeply knowledgeable. Like a friend who really understands the landscape reviewing your setup over coffee.

**Examples of the voice in action:**
- *"You stopped being the driver and became the manager. Most devs never make this jump."* (Operator tier)
- *"You're a tourist in the land of code — but the gap between you and a Level 20 Apprentice is shockingly small."* (Observer tier)
- *"Your SOUL.md is genuinely interesting. We usually only see this level of personality definition in the top 3% of setups."* (Analysis)
- *"Add a .github/workflow/ci.yaml. You'll jump from level 42 to level 48 immediately."* (Recommendation)

**The voice is NOT:** Robotic, vague, generic, or patronizing. Never "CLI agent detected. Level: Operator." Never "Consider improving your CI pipeline." Every output should feel like a human who knows their stuff is talking directly to you.

The tier taglines (*"A tourist in the land of code," "The AI becomes a partner,"* etc.) are the distilled essence of this voice and should appear prominently in all tier-related displays.

---

## 7. Non-Goals

- **We are NOT a hiring gatekeeper.** Every archetype is positioned positively. "The Tinkerer" is as valid as "The Orchestrator." No type is better — they reflect different styles.

- **We are NOT a traditional dev skills assessment.** We don't test if you can reverse a binary tree. We assess how effective, efficient, and innovative your stack is — and how in-the-loop you are as a developer iterating with the help of AI.

- **We are NOT supporting non-terminal users in v1.** If you can't run `npx`, the probe layer is skipped and scoring is less accurate. Our core audience lives in the terminal.

- **We are NOT optimizing for MAU/DAU.** This is a take-the-assessment-share-and-return product.

- **We are NOT a social network.** Profile pages are display-only. No comments, follows, or feeds.

- **We are NOT collecting file contents, credentials, or secrets.** The probe checks for file/dir existence, reads config structure (agent settings, tool lists, MCP registrations), and greps for tool references. It never reads source code, credentials, or private data.

---

## 8. The Probe — Deep Scan Architecture

The probe is the product. It needs to be thorough, fast, transparent, and delightful.

### What the Probe Scans

#### Environment Layer
- **AI Models:** API keys present (not the keys — just which providers), model references in configs, default model settings
- **MCP Servers:** Installed MCP servers, their configs, what capabilities they provide
- **CLI Tools:** Which AI CLI tools are installed (claude, cursor, codex, gemini, openclaw, etc.) and their versions
- **Shell Setup:** .zshrc/.bashrc for AI-related aliases, env vars, tool integrations
- **Editor Config:** VS Code extensions (AI-related), Cursor settings, editor-level AI integrations

#### Repository Layer
- **CLAUDE.md / AGENTS.md / EVOLVE.md:** Reads these files to understand how the user has configured their AI agent's behavior, personality, rules, and workflow. This is the richest signal — a well-crafted CLAUDE.md reveals enormous sophistication.
- **.cursorrules:** Cursor-specific agent configuration
- **CI/CD:** GitHub Actions, Vercel configs, deploy scripts
- **Testing:** Test frameworks, coverage configs
- **Security:** .gitignore patterns, secret management, sandboxing configs

#### Agent Config Layer
- **OpenClaw/Clawdbot:** Reads config to detect: heartbeat intervals, skills installed, memory systems, channel integrations, tool permissions
- **Claude Code:** Settings, allowed tools, default model, thinking level
- **Cursor:** Rules files, workspace-level configs
- **Custom agents:** Any agent framework configs detected in repos

### What the Probe Does NOT Scan
- Source code contents
- File contents beyond agent configs and tool manifests
- Credentials, API keys, or secrets (detects presence, never reads values)
- Browser history, shell history, or personal files
- Anything outside the user's git repos and dotfiles

### Probe Output
The probe produces a structured JSON payload containing:
- List of detected tools with versions
- Agent config summaries (structure/features, not raw content)
- Capability flags per category
- Innovation flags for anything outside the known taxonomy
- A human-readable terminal summary with colors and emoji

The user reviews the full output before submitting.

---

## 9. Scoring System

### The 8 Capability Categories

Each category scores 0–100. The overall level is a weighted composite.

| Category | Code | What It Measures | Primary Detection Source |
|---|---|---|---|
| **Model Breadth** | M | Diversity and sophistication of AI models used | Probe: configs, API key presence, model references |
| **Agentic Depth** | A | Use of autonomous agents, sub-agents, memory, planning loops | Probe: MCP servers, agent configs (CLAUDE.md, EVOLVE.md), memory systems |
| **Workflow Rigor** | R | CI/CD, testing, linting, deploy pipeline maturity | Probe: CI configs, test frameworks, deploy scripts |
| **Developer Experience** | D | Editor setup, terminal config, productivity tooling | Probe: dotfiles, editor configs, shell setup |
| **Security Posture** | S | Credential management, sandboxing, permission scoping | Probe: file permissions, .gitignore, secret storage |
| **Shipping Velocity** | V | Deploy frequency, project count, iteration speed | Probe: git history, deploy configs + Questions |
| **Tool Integration** | T | How well tools work together — MCP ecosystem, pipelines, agent-to-agent | Probe: integration patterns, cross-tool configs |
| **AI Collaboration** | C | How thoughtfully the human configures and works with AI | Probe: CLAUDE.md quality, agent rules, review patterns + Questions |

### Taxonomy Classification

Every detected tool is classified into one of these categories. The taxonomy is maintained as a living data structure that grows as the ecosystem evolves.

Known taxonomy includes:
- **AI Models:** OpenAI, Anthropic, Google, xAI, Mistral, local (Ollama, LM Studio)
- **Agent Frameworks:** Claude Code, Cursor, OpenClaw/Clawdbot, Codex, Windsurf, Aider
- **MCP Servers:** By capability (filesystem, database, API, browser, etc.)
- **Memory Systems:** Vector stores, file-based memory, session persistence
- **Deploy Pipelines:** Vercel, Netlify, Railway, Docker, custom
- **Testing:** Jest, Vitest, Playwright, custom
- **Security:** Secret managers, sandboxing, permission systems

**Innovation flags:** When the probe detects something outside the known taxonomy — a custom MCP server, a novel agent config pattern, an unusual integration — it gets flagged as an "innovation." These are highlighted in the results as "ahead of the curve" and contribute bonus points to the relevant category. **Innovation flags are also the primary input for Pioneer badge eligibility** — ≥1 high-confidence or ≥3 medium-confidence flags earns the coveted Pioneer distinction (see The Pioneer Badge section above).

### Tier Titles (The Evolution Ladder)

Every score maps to an official **tier title** — a sticky, human-readable name for where the developer sits on the evolution ladder:

| Level Range | Tier Title | Tagline |
|------------|-----------|---------|
| 0-10 | Observer | *"A tourist in the land of code"* |
| 11-20 | Apprentice | *"The AI is just a very chatty GPS"* |
| 21-30 | Practitioner | *"You crossed into YOLO mode"* |
| 31-45 | Builder | *"The AI becomes a partner"* |
| 46-55 | Operator | *"You stop typing syntax. You become a manager"* |
| 56-65 | Commander | *"Managing a parallel workforce"* |
| 66-75 | Architect | *"You aren't coding anymore"* |
| 76-85 | Orchestrator | *"Orchestrating a system of digital workers"* |
| 86-100 | Industrialist | *"A self-sustaining software factory"* |

Tier titles are the primary display element — bigger and more prominent than the numerical score. The taglines (drawn from the audio overview and validated by Gary) are the voice of the product: warm, specific, slightly irreverent. They appear as italic subtitles on the shareable card and in the smart mirror output.

See the [Vibe Coder Taxonomy](./vibe-coder-taxonomy.md) Section 3 for full tier descriptions and scoring criteria.

### 4-Letter Type Assignment

The 4-letter type is derived from the top 4 scoring categories, ordered by score. Example: if your top 4 are Model Breadth, Agentic Depth, Workflow Rigor, Developer Experience → **MARD**.

### The Pioneer Badge 🏔️ — Cross-Cutting Prestige Modifier

Independent of the 0-100 level score, the probe can award the **Pioneer badge** — a coveted prestige modifier recognizing genuine innovation. Pioneer is NOT a score tier. It's a cross-cutting distinction, like Google's Distinguished Engineer or Fellow designation.

**How it works:**
- The probe's innovation detection flags novel patterns: custom MCP servers, unknown taxonomy items, unconventional integrations
- ≥1 high-confidence innovation flag OR ≥3 medium-confidence flags earns Pioneer
- Pioneer can be earned at ANY level — a Level 30 developer who builds a novel MCP server qualifies
- Pioneer cards get a **gold/iridescent border**, 🏔️ icon, and the specific innovation named on the card

**Why it matters for GTM:**
- **"Am I doing something innovative?"** — a major draw for running the probe. Everyone secretly hopes to earn Pioneer
- **Gold rush dynamic** — creates urgency and excitement. The badge is scarce (<5% of early scans) and can't be gamed
- **Self-reinforcing flywheel** — Pioneer incentivizes the exact behavior (building novel tools, pushing boundaries) that advances the ecosystem. Each Pioneer's innovation eventually gets absorbed into the taxonomy, raising the bar for the next one
- **Credential enhancer** — "Level 35 Pioneer" is more impressive in a specific way than "Level 85 Orchestrator." It carries real social weight
- **Share magnet** — Pioneer cards are visually distinct and prestigious. They're the cards most likely to go viral

See the full Pioneer specification in the [Vibe Coder Taxonomy](./vibe-coder-taxonomy.md) Section 3.5.

### 16 Archetypes

Each 4-letter combination maps to a named archetype with a personality description. Examples:

- **MARD — The Orchestrator:** Deep model expertise, agentic workflows, rigorous process. Runs a symphony of AI tools.
- **VTCS — The Blitz Builder:** Ships fast, integrates everything, collaborates fluidly with AI. Velocity is the vibe.
- **SDRT — The Fortress:** Security-first, polished DX, methodical. Nothing gets past them.
- **CAVT — The Experimenter:** AI-native to the core. Tries every model, every tool, every workflow. Always on the bleeding edge.

*(Full 16 archetypes to be defined before dev starts.)*

---

## 10. Technical Architecture

### Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 15 + Tailwind | Vercel-native, Satori integration, fast iteration |
| Backend | Next.js API routes (serverless) | Simple. No separate backend until needed |
| Database | Supabase (Postgres) | User profiles, scores, history. Ready for percentile queries when needed |
| Auth | X OAuth 2.0 (primary), GitHub OAuth (v1.1) | X is the sharing platform. GitHub is the enrichment source |
| Card Generation | Satori (@vercel/og) | HTML/CSS → SVG → PNG at the edge. Fast, deterministic |
| Probe | npm package (vibecheck-probe) | TypeScript CLI, runs locally, outputs JSON |
| Taxonomy | JSON data file in the probe package | Living taxonomy of known AI-native dev tools and patterns |
| Hosting | Vercel | Free tier generous, edge functions, built-in OG support |
| Analytics | Simple Analytics or Plausible | Privacy-respecting, lightweight |

### Architecture Diagram

```
Twitter Card → vibecheck.dev (Next.js on Vercel)
        ↓
X OAuth → Profile scan (Layer 1)
        ↓
User Terminal → npx vibecheck-probe
        ↓
Local deep scan: env + repos + agent configs → JSON
        ↓ (user reviews + submits)
vibecheck.dev/api/submit → Taxonomy classification engine
        ↓
5 Questions (Layer 3) → Final composite score
        ↓
Scoring engine → Level + Type + Tool breakdown + Innovation flags
        ↓
Satori card generation → PNG → Profile page
        ↓
Share to X → New users see card → Loop
```

### Key Technical Decisions

1. **Satori over Puppeteer** for card generation — edge-compatible, deterministic, fast. Trade-off: limited CSS (flexbox only, no grid). Sufficient for card layouts.

2. **npx probe as separate npm package** — decoupled from website. Versioned independently. Users can inspect source before running.

3. **No local persistence in the probe** — scan, output, done. No daemon, no cache, no lingering processes.

4. **Taxonomy as data, not code** — the tool classification taxonomy lives in a JSON file that can be updated without code changes. New tools get added as the ecosystem evolves.

5. **Repo scanning is local-only in v1** — the probe scans local git repos. GitHub API integration comes in v1.1 for remote repo scanning.

6. **Supabase from day 1** — even though we don't need percentiles yet, storing all assessments in Supabase means we're ready to compute them when we hit critical mass.

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Probe detection accuracy across OSes | Medium | High | macOS primary; Linux + WSL need testing |
| Satori CSS limitations for radar chart | Low | Medium | Prototype week 1; SVG inline fallback |
| X OAuth rate limits at scale | Medium | Medium | Aggressive caching |
| npx cold start time | Low | Low | Keep probe package <5MB |
| CLAUDE.md / agent config format fragmentation | Medium | Medium | Support known formats, graceful fallback for unknown |
| Privacy backlash ("this scans my repos") | Medium | High | Open source probe. Show full output before submit. Never read source code or secrets |

---

## 11. Success Metrics

### North Star Metric

**Cards shared to X per week.** If people take the assessment and don't share, the product isn't working. If they share, growth is organic.

### Leading Indicators

| Timeframe | Metric | Target | How to Measure |
|---|---|---|---|
| Week 1 | Assessments completed | 200 | Supabase count |
| Week 1 | Share rate (completed → shared to X) | >40% | Track share button clicks vs completions |
| Month 1 | Total assessments | 2,000 | Supabase |
| Month 1 | Organic referral rate | >50% came from seeing a card | UTM tracking on profile URLs |
| Month 1 | Probe completion rate | >60% of starters | Funnel analytics |
| Month 3 | Return users (re-assessment) | 15% run probe again | User event tracking |

### Failure Criteria

If by 8 weeks post-launch, fewer than 500 total assessments despite launching on HN, r/vibecoding, r/ClaudeAI, and Twitter → reassess the concept. Likely failure mode: probe friction too high, or the types don't resonate enough to share.

---

## 12. Risks & Open Questions

### Risks

| Risk | Category | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| Probe friction kills conversion | Product | High | High | Make probe output delightful (colors, ASCII art, fun commentary). Consider "skip probe" with reduced accuracy |
| Types/scores don't feel credible | Product | Medium | Critical | Test with 10–20 real users. Calibrate scoring. The tool breakdown adds substance beyond just a type label |
| Privacy backlash ("scans my repos") | Market | Medium | High | Open source the probe. Show full output before submit. Clear docs on what's scanned vs not |
| Satori can't render desired card design | Technical | Low | Medium | Prototype during week 1. Puppeteer fallback |
| "Vibe coding" hype cycle fades | Market | Low | Medium | The underlying need persists even if the term evolves |
| Copycats launch quickly | Market | Medium | Low | First-mover with deep probe is our moat. Taxonomy + scoring algorithm are hard to replicate well |
| Posers faking scores (downloading others' repos/configs) | Product | Low (v1) | Low (v1) | Defer. Not a v1 problem. Address with coding assignment or GitHub verification in v2 |

### Open Questions

| Question | Owner | Deadline |
|---|---|---|
| Final 16 archetype names + descriptions | Gary | Before dev starts |
| Category weight calibration | Gary + Jerome | During beta, calibrate with real data |
| Domain name (vibecheck.dev vs alternatives) | Gary | Before dev starts |
| Scoring rubric for probe detections | Jerome (with Claude Code) | Week 1 of dev |
| Initial taxonomy data file | Jerome (with Claude Code) | Week 1 of dev |
| Pricing tiers for paid tier | Gary | Post-launch |

---

## 13. Go-to-Market

### Launch Strategy

**Phase 0: Dogfood (Day -7)**
- Gary takes the assessment. 5–10 friends/mutuals take it.
- Collect feedback on types, scores, card design, probe UX, tool breakdown quality.
- Fix critical issues.

**Phase 1: Seeding (Day 1–3)**
- Gary shares his card on X with a casual "just got my vibe check" post. Not a product launch — a personal share.
- Tag no one. Let the card speak.
- Share in private group chats / Discords of builder friends.

**Phase 2: Community Launch (Day 4–10)**
- Post to r/vibecoding (4,100+ member Discord, active subreddit)
- Post to r/ClaudeAI, r/CursorAI (tool-specific audiences)
- Share in vibe coding Discord servers (BridgeMind: 20,000+ members)
- Cross-post to dev.to with a "how we built it" article

**Phase 3: Public Launch (Day 14–21)**
- Hacker News "Show HN" (lead with the probe — HN loves CLI tools)
- Product Hunt launch (if organic traction exists)
- Twitter thread: "We built a smart mirror for vibe coders" with example cards from each archetype

### Distribution Channels

| Channel | Expected Reach | Effort | Priority |
|---|---|---|---|
| Twitter/X (organic card sharing) | High — viral loop | Medium — card design must be excellent | 1 |
| r/vibecoding + r/ClaudeAI + r/CursorAI | Medium-High (200K+ combined) | Medium — authentic posts, not ads | 2 |
| Vibe coding Discord servers | Medium (20K+ across servers) | Low | 3 |
| Hacker News Show HN | High (if front page) | Medium — need good writeup | 4 |

### Pricing (v1 = free, v2 = freemium)

| Tier | Price | Includes |
|---|---|---|
| Free | $0 | Full assessment, type + level, shareable card, profile page, tool breakdown |
| Pro (v2) | $9/mo or $49/yr | Detailed category breakdowns, historical tracking, embeddable badges, team comparisons, percentile ranking |

---

## 14. Timeline & Milestones

| Week | Milestone | Deliverable | Validation |
|---|---|---|---|
| 1 | Probe prototype | npx package that deep-scans env + repos + agent configs, outputs classified JSON | Run on 3+ machines (Mac, Linux, WSL). Detections are accurate. CLAUDE.md parsing works |
| 2 | Scoring engine + card design | Algorithm: probe JSON + questions → type + level. Satori card renders. Taxonomy classification working | Card looks good on Twitter. Scoring produces believable results |
| 3 | Web app MVP | Landing page, X OAuth, probe submit flow, 5 questions, result page with tool breakdown, profile page, share button | End-to-end flow works. First 10 real users complete it |
| 4 | Dogfood + polish | Bug fixes, copy refinement, archetype descriptions, card design iteration, taxonomy tuning | 20+ beta users completed. Feedback incorporated |
| 5 | Soft launch | Share to communities (Reddit, Discord) | 200 assessments. Share rate measured |
| 6 | Public launch | HN Show HN, broader social push | 1,000 assessments. Viral loop observed (or not) |

### Kill Date

**March 31, 2026.** If fewer than 500 total assessments and share rate below 20% by this date → shelve or fundamentally rethink.

---

## 15. Appendix

### Research Notes

**LinkedIn Vibe Coding Credentials (Jan 28, 2026):** LinkedIn partnered with Lovable, Replit, Relay.app, Descript to display AI coding credentials in "Licenses & Certifications." GitHub, Zapier, Gamma coming next. Key quote from LinkedIn's Pat Whealan: "This is less about replacing any of those other existing signals, and more about showing new ways that people are doing work. And how do we give a verifiable signal to both hirers and other people looking at their profile, that they actually are using these tools on a regular basis." All current implementations are platform-specific usage counters. None assess cross-platform setup sophistication. (Sources: Engadget, Fast Company, Yahoo/Social Media Today, Lovable docs)

**Lovable credential deep-dive:** Levels based purely on messages sent. Bronze → Silver → Gold → Platinum → Diamond. No quality assessment. Settings → Your account → "Add to LinkedIn." Auto-updates. This is the bar we're competing against — and it's very low.

**Market signals:** r/vibecoding active subreddit + Discord (4,100+ members). BridgeMind Discord: 20,000+ vibe coders. Multiple Reddit threads show developers wrestling with identity and credentialing questions around AI coding. Collins Dictionary: "vibe coding" = 2025 Word of the Year.

**Steve Yegge's Gas Town (Jan 1, 2026):** Defines 8 stages of AI developer evolution from "Zero AI" to "Building your own orchestrator." The high end of the spectrum (Stages 6-8: multi-agent CLI, 10+ hand-managed agents, custom orchestrators) represents the serious builders that LinkedIn's platform partners completely miss. Gas Town also defines 7 worker roles (Mayor, Polecats, Refinery, Witness, Deacon, Dogs, Crew) that inform our taxonomy of agent mechanisms.

**16Personalities playbook:** Freemium, free quiz + paid premium ($29–99). 1B+ tests taken. Key insight: memorable archetype names + identity artifacts create shareable social objects.

**HackerRank playbook:** Trusted by employers. Badges carry weight. Key insight: standardized assessment + relative ranking = credible signal.

**NPM as distribution:** Claude Code, Gemini CLI, and 6,700+ MCP servers distribute via npm. `npx` enables instant execution — our probe fits this pattern.

**Satori limitations:** Flexbox only, no grid. Sufficient for card layouts. Use inline SVG for radar charts.

### Change Log

| Date | Change | Reason |
|---|---|---|
| 2026-01-31 | Initial draft | — |
| 2026-02-01 | v2 refactor | Gary's redline: repositioned from personality quiz → credentialing/benchmarking. Updated personas. Removed internal context |
| 2026-02-01 | v2.1 refactor | Gary's direction: removed coding assignment from v1, removed percentile ranking from v1, removed LinkedIn features from v1. Beefed up probe to deep-scan repos (CLAUDE.md, EVOLVE.md, agent configs). Reframed v1 as "smart mirror" with tool taxonomy classification + innovation spotting. Relative scoring deferred to post-200-user critical mass |
| 2026-02-01 | v2.2 refactor | LinkedIn competitive intel: LinkedIn launched vibe coding credentials Jan 28 with Lovable, Replit, Relay.app, Descript. All are shallow platform-specific usage counters. Repositioned Vibe Coder Score as the cross-platform depth-based alternative for serious CLI-native builders. Added LinkedIn partner ecosystem to competitive landscape and v2 roadmap. Incorporated Yegge's Gas Town taxonomy (8 stages, 7 worker roles) as framework reference |
| 2026-02-02 | v2.3 | **Pioneer badge as GTM differentiator:** Added Pioneer badge section — a cross-cutting prestige modifier awarded independently of level score. Pioneer recognizes genuine innovation (custom MCP servers, novel architectures, taxonomy-breaking patterns). Creates "gold rush" dynamic: everyone wants to see if they qualify. Updated elevator pitch, core features, scoring, and shareable card spec to incorporate Pioneer. See taxonomy v1.2 for full Pioneer specification |
| 2026-02-02 | v2.4 | **Tier titles + audio voice:** Added 9 official tier titles (Observer → Industrialist) with taglines from NotebookLM audio overview to scoring section. Updated shareable card spec: Tier Title (large) + Level + Archetype Code + Tagline (italic). Updated user journey to reference tier titles in discovery and reveal steps. Added Section 6.5 "The Voice" defining the audio-inspired tone as canonical for all UX output. See taxonomy v1.3 for full tier descriptions |
