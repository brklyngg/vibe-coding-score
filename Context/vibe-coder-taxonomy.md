# Vibe Coder Taxonomy — The Zoology of AI-Native Developer Setups

**Author:** Jerome (with Gary's direction)
**Date:** 2026-02-01
**Status:** Living Document — v1.3
**Purpose:** Intellectual foundation for the Vibe Coder Score probe, scoring engine, and smart mirror analysis.

---

## Table of Contents

1. [Overview & Design Philosophy](#1-overview--design-philosophy)
2. [The Taxonomy Framework](#2-the-taxonomy-framework)
   - 2.1 Category I: Foundation Layer (Models & Providers)
   - 2.2 Category II: Interface Layer (How You Talk to AI)
   - 2.3 Category III: Agent Architecture (Autonomy & Orchestration)
   - 2.4 Category IV: Context Engineering (Memory, Identity & Persistence)
   - 2.5 Category V: Development Infrastructure (CI/CD, Testing, Deploy)
   - 2.6 Category VI: Tool Ecosystem (MCP, Skills, Integrations)
   - 2.7 Category VII: Security & Governance
   - 2.8 Category VIII: Social & Collaboration Layer
3. [The Evolution Ladder](#3-the-evolution-ladder)
   - 3.5 [The Pioneer Badge](#35-the-pioneer-badge-)
4. [Innovation Detection](#4-innovation-detection)
5. [Scoring Rubric](#5-scoring-rubric)
6. [The Smart Mirror Output Spec](#6-the-smart-mirror-output-spec)
7. [Appendix: Tool Registry](#7-appendix-tool-registry)

---

## 1. Overview & Design Philosophy

### What This Document Is

This is the **field guide** for the Vibe Coder Score probe. It classifies every type of mechanism, worker, component, and pattern that exists in an AI-native developer's setup as of early 2026. The probe uses this taxonomy to:

1. **Detect** — Identify what's present in a developer's environment
2. **Classify** — Place each finding into the taxonomy
3. **Score** — Assess sophistication within each category
4. **Narrate** — Tell the developer a story about their setup that's insightful and specific

### The Key Insight

Steve Yegge's Gas Town article (Jan 1, 2026) crystallized something the community was already feeling: **the evolution of the AI-native developer is from passive tool user → active orchestrator of AI labor.** His 8 stages of dev evolution capture the trajectory. His 7 worker roles (Mayor, Polecats, Refinery, Witness, Deacon, Dogs, Crew) describe what the endpoint looks like when you're running 20-30 agents.

But most developers aren't at the endpoint. They're somewhere on the journey. Our job is to meet them wherever they are and show them:
- Where they are (honestly)
- What's impressive about their setup (specifically)
- What the next level looks like (concretely)
- What's genuinely novel about their approach (if anything)

### The Spectrum We're Mapping

At one end: a developer who uses ChatGPT in a browser tab to ask questions about code.
At the other end: someone running a Gas Town-style orchestrator with 20+ specialized agents, a merge queue, supervisor agents, heartbeat daemons, custom MCP servers, and a memory system that gives their AI workforce persistent context across sessions.

Between those poles is a rich, fascinating landscape of setups that nobody has mapped comprehensively. Until now.

### What Existing Credentials Get Wrong

On January 28, 2026, LinkedIn launched "vibe coding credentials" with Lovable, Replit, Relay.app, and Descript. Zapier and GitHub are coming next. This validated the market — but exposed a massive gap in how AI skills are assessed:

**Every existing credential measures usage volume, not setup sophistication.**

- **Lovable:** Bronze → Diamond based on message count. More prompts = higher level. A person who sends 10,000 low-quality prompts outscores someone with an elegant, well-configured setup.
- **Replit:** Numerical levels tied to platform usage. Same problem — quantity, not quality.
- **Relay.app:** Beginner/Intermediate/Advanced for "AI Agent Builder." Closest to a real taxonomy, but locked to one platform.
- **Descript:** Video/audio editing. Not even coding.

**Zapier's internal 4-tier AI fluency framework** is the most serious thing out there: Unacceptable → Capable → [two higher tiers]. Their senior roles require "MCP server development and cross-platform AI system analysis." This is the only place we've found that even mentions MCP in a skills context — and it's an internal hiring rubric, not a public credential.

**Our taxonomy is fundamentally different.** We measure:
- **Configuration quality** over usage volume (a well-crafted 50-line CLAUDE.md outscores 10,000 chat messages)
- **Cross-platform sophistication** over single-tool engagement (how your models, agents, MCP servers, and deploy pipeline work together)
- **Architecture depth** over surface-level tool adoption (subagents, memory layers, security governance — not just "do you use Cursor")
- **Innovation** beyond the known landscape (custom MCP servers, novel agent patterns, things the taxonomy hasn't seen)

### The No-Code ↔ CLI Spectrum

The vibe coding landscape spans a wide spectrum:

```
No-Code GUI          Low-Code IDE          CLI-First              Orchestrator
(Lovable, Replit)    (Cursor, Windsurf)    (Claude Code, Codex)   (Gas Town, custom)
← LinkedIn partners serve this end                    We serve this end →
```

LinkedIn's partners credential the left side of this spectrum — people building apps via chat interfaces and visual builders. Nobody credentials the right side — the builders running CLI agents, writing CLAUDE.md files, managing MCP ecosystems, and orchestrating multi-agent workflows.

That's our audience. The serious builders doing deep work in the terminal. Enterprise-grade applications aren't being built in Lovable. They're being built with Claude Code, custom agent configs, and sophisticated toolchains that no existing credential can see.

### Core Design Principles

1. **Every position is valid.** A "Level 15 SGRL" is a real builder. We don't gatekeep. We illuminate.
2. **Quality over quantity.** We never score based on usage volume. A developer who sends 50 thoughtful, well-structured prompts with a crafted CLAUDE.md outscores one who sends 5,000 messages in Lovable. Configuration sophistication > engagement metrics.
3. **Detection before judgment.** The taxonomy classifies first, scores second. The probe needs to accurately identify what's present before we assess its sophistication.
4. **Specificity over generality.** "You use Claude Code" is boring. "You have a CLAUDE.md with 47 lines covering architecture patterns, a custom subagent for code review, and 3 MCP servers — but no memory system" is interesting.
5. **Cross-platform by design.** We assess the full stack — models, agents, MCP servers, memory, deploy, security — across all tools. We're not locked to one platform's view.
6. **The zoology evolves.** This taxonomy will be out of date in 6 months. New tools, new patterns, new categories will emerge. The probe must flag things it doesn't recognize as potential innovations, not ignore them.

---

## 2. The Taxonomy Framework

### How to Read Each Entry

For every mechanism in the taxonomy:
- **What it is** — Plain description
- **Sophistication signal** — What it tells us about the developer
- **Detection method** — How the probe finds it
- **Examples** — Real tools and implementations
- **Scoring tier** — Basic / Intermediate / Advanced / Elite

---

### 2.1 Category I: Foundation Layer — Models & Providers

This is the bedrock. Which AI models does the developer have access to, and how are they configured?

#### 2.1.1 Primary Model Provider

**What it is:** The main AI model the developer uses for coding tasks.

**Sophistication signal:**
- Having *any* model configured → baseline (this is table stakes in 2026; 85% of devs use AI tools)
- Having a frontier model (Claude 4/Opus 4.5, GPT-5.2, Gemini 2.5 Pro) → staying current
- Having multiple providers → strategic thinking about model strengths
- Running local models alongside cloud → privacy awareness + cost optimization

**Detection method:**
- Check for API key environment variables: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `XAI_API_KEY`, `MISTRAL_API_KEY`, `TOGETHER_API_KEY`, `GROQ_API_KEY`
- Check CLI tools installed: `claude`, `codex`, `gemini`, `ollama`, `lms`
- Parse config files for model references (`.claude/settings.json`, Cursor settings, OpenClaw config)
- Check for model-specific aliases in shell config

**Examples:**
| Provider | Models (as of Jan 2026) | Signal |
|----------|------------------------|--------|
| Anthropic | Claude 4 Opus, Claude 4.5 Opus, Claude 3.5 Sonnet, Haiku | Frontier + cost-tier strategy |
| OpenAI | GPT-5.2, GPT-5.2-codex, o3, o3-mini | Strong reasoning tier |
| Google | Gemini 2.5 Pro, Gemini 2.5 Flash | Large context windows, search integration |
| xAI | Grok-4, Grok-3, Grok-code-fast | Social/search integration, fast inference |
| Mistral | Codestral, Large 2 | European provider, privacy-conscious |
| Meta | Llama 4 (via Ollama/Together) | Open-source preference |
| Local | Via Ollama, LM Studio, llama.cpp | Privacy, offline capability, cost control |

**Scoring tiers:**
- **Basic (0-25):** Single model, default config, no API keys (using chat interface only)
- **Intermediate (26-50):** One cloud provider with API key + CLI tool configured
- **Advanced (51-75):** 2-3 providers, model selection strategy visible in configs
- **Elite (76-100):** 3+ providers including local models, model routing logic, task-specific model selection documented in agent configs

---

#### 2.1.2 Model Routing & Selection Strategy

**What it is:** Evidence that the developer consciously chooses different models for different tasks — fast models for simple tasks, powerful models for complex ones, specialized models for specific domains.

**Sophistication signal:** This is one of the strongest signals of a mature AI-native developer. A novice picks one model and uses it for everything. An expert has a "stable" of models and knows each one's strengths.

**Detection method:**
- Multiple model references in agent configs with different contexts
- Custom aliases or scripts that invoke different models (e.g., `alias quick='claude --model haiku'`, `alias think='claude --model opus --thinking high'`)
- OpenClaw-style configs with thinking level settings
- Gas Town's model pinning per worker role
- Config files showing model fallback chains

**Examples:**
- Claude Code `--model` flag usage patterns
- Cursor model selection in settings
- OpenClaw's `default_model` + `thinking` level configuration
- Custom scripts that route to different providers: "use Gemini for search-heavy tasks, Claude for architecture, GPT for codegen"
- `.claude/settings.json` with per-project model overrides
- Config showing Haiku/Flash for routine tasks, Opus/Pro for complex reasoning

**Scoring tiers:**
- **Basic (0-25):** Default model, never changed
- **Intermediate (26-50):** Manual model switching (using flags, different tools for different tasks)
- **Advanced (51-75):** Documented model strategy in agent configs, 2+ models actively used with clear division of labor
- **Elite (76-100):** Automated model routing, cost optimization logic, model fallback chains, task-type-to-model mapping

---

#### 2.1.3 Context Window Utilization

**What it is:** How the developer manages and optimizes the context window — the amount of information the model can "see" at once.

**Sophistication signal:** Understanding context windows is a hallmark of serious AI tool usage. Novices paste everything into chat. Experts engineer their context deliberately.

**Detection method:**
- CLAUDE.md file length and structure (well-structured = context-aware)
- Use of `@imports` or file references in agent configs
- `.claude/rules/` directory with split rules files
- Cursor's `.cursorrules` with thoughtful context management
- Evidence of context pruning, summarization strategies
- Use of codebase indexing features

**Examples:**
- CLAUDE.md that uses `@imports` to pull in specific context: `@docs/architecture.md`
- Split rules across `.claude/rules/testing.md`, `.claude/rules/style.md`, etc.
- RAG-style setups with embeddings for large codebases
- Custom summary files maintained for agent context
- Project-specific vs. global context separation

**Scoring tiers:**
- **Basic (0-25):** No context management artifacts
- **Intermediate (26-50):** Single CLAUDE.md or .cursorrules file, <20 lines
- **Advanced (51-75):** Well-structured agent manifest with sections, context imports, split rules
- **Elite (76-100):** Multi-layer context architecture, dynamic context loading, RAG integration, context budget management

---

### 2.2 Category II: Interface Layer — How You Talk to AI

The interface layer captures *how* the developer interacts with AI. This is where Yegge's evolution stages are most visible.

#### 2.2.1 Chat/Browser Interface

**What it is:** Using AI through a web browser — ChatGPT, Claude.ai, Gemini, etc.

**Sophistication signal:** This is Stage 1 in Yegge's evolution. Everyone starts here. Using *only* chat is a signal of early-stage adoption. Using chat *alongside* more advanced tools (e.g., for research, brainstorming) while coding in CLI/IDE is perfectly sophisticated.

**Detection method:**
- Absence of CLI tools or IDE agents (suggests chat-only)
- Browser bookmarks/history (not scanned — privacy)
- Self-reported in questionnaire

**Examples:** ChatGPT, Claude.ai, Gemini, Perplexity, Poe

**Scoring tiers:**
- **Basic (0-25):** Chat-only usage, no local tools
- **Intermediate (26-50):** Chat for research/brainstorming alongside IDE/CLI tools
- **Advanced (51-75):** Deliberate use of chat for specific tasks (design review, architecture planning) with structured prompting
- **Elite (76-100):** Chat interfaces augmented with custom GPTs/Projects, systematic prompt libraries

---

#### 2.2.2 IDE-Integrated Agent (Sidebar/Inline)

**What it is:** AI coding assistant built into the editor — code completions, chat panel, inline suggestions.

**Sophistication signal:** Stages 2-4 in Yegge's evolution. The progression is: completions only → chat + completions → agent with tool permissions → full-screen agent (YOLO mode). Each step represents increasing trust in the AI.

**Detection method:**
- VS Code extensions: `github.copilot`, `continue.continue`, `cline`, `roo-code`, `augment`
- Cursor installation (`which cursor`, Cursor configs in `~/.cursor/`)
- Windsurf installation and configs
- JetBrains AI plugins (Junie, Copilot)
- Extension settings showing permission levels (auto-apply vs. ask-first)

**Examples:**
| Tool | Interface | Key Feature | Signal |
|------|-----------|-------------|--------|
| GitHub Copilot | VS Code/JetBrains | Completions + chat + agent mode | Industry standard, low signal alone |
| Cursor | Full IDE | Composer/Agent multi-file, repo-indexed | Power user, context-aware |
| Windsurf | Full IDE | Cascade flows, proactive suggestions | Early-adopter, Codeium ecosystem |
| Cline | VS Code extension | Autonomous agent, plan-and-execute | High autonomy preference |
| RooCode | VS Code extension | Multiple agent modes, MCP support | Tinkerer, configurator |
| Continue.dev | VS Code/JetBrains | Open-source, multi-provider, local models | Privacy-conscious, DIY ethos |
| Augment | VS Code/JetBrains | Enterprise-focused, codebase understanding | Team player, enterprise context |
| JetBrains Junie | JetBrains IDEs | IDE-native agent | JetBrains loyalist |

**Scoring tiers:**
- **Basic (0-25):** Code completions only (Copilot completions, no chat)
- **Intermediate (26-50):** Agent with permissions enabled, chat panel active, some YOLO
- **Advanced (51-75):** Multi-file agent workflows (Cursor Composer), custom rules, workspace configs
- **Elite (76-100):** Multiple IDE tools configured, custom prompting strategies, agent mode fully autonomous

---

#### 2.2.3 CLI Agent (Terminal-First)

**What it is:** AI coding agent run from the command line — no IDE wrapper. The agent reads/writes files, runs commands, and operates directly in your development environment.

**Sophistication signal:** Stage 5+ in Yegge's evolution. Moving to CLI signals a shift from "AI assists my coding" to "AI *does* coding while I direct." This is a significant psychological and practical leap.

**Detection method:**
- CLI tools installed: `claude` (Claude Code), `codex` (OpenAI Codex CLI), `gemini` (Gemini CLI), `amp`, `aider`, `goose`, `opencode`
- Shell aliases for CLI agents
- tmux/screen configs suggesting multi-pane agent workflows
- CLAUDE.md files in repos (strong signal of Claude Code usage)
- Command history patterns (not scanned — but `.zshrc` aliases are)

**Examples:**
| Tool | Provider | Key Feature | Signal |
|------|----------|-------------|--------|
| Claude Code | Anthropic | Gold standard CLI agent, subagents, hooks, skills | Frontier user |
| Codex CLI | OpenAI | Full-auto mode, sandboxed execution | OpenAI ecosystem, YOLO-minded |
| Gemini CLI | Google | Huge context window, Google integration | Context-heavy workflows |
| Amp | Sourcegraph | Code intelligence, repo understanding | Codebase-aware workflows |
| Aider | Open source | Git-native, multi-model, pair programming | OSS preference, git-first |
| Goose | Block | MCP reference implementation | MCP-first philosophy |
| OpenCode | Open source | TUI interface, multi-provider | Terminal UI enthusiast |

**Scoring tiers:**
- **Basic (0-25):** CLI agent installed but rarely used (default config)
- **Intermediate (26-50):** Regular CLI usage, custom aliases, some tool permissions configured
- **Advanced (51-75):** CLI as primary interface, CLAUDE.md crafted, tool permissions tuned, hooks configured
- **Elite (76-100):** CLI agent deeply customized — subagents defined, slash commands, skills, hooks, thinking levels optimized per task type

---

#### 2.2.4 Multi-Agent / Parallel Execution

**What it is:** Running multiple AI agent instances simultaneously, each working on different tasks. This is the leap from Stage 5 (single CLI agent) to Stage 6-7 (multi-agent).

**Sophistication signal:** This is where things get serious. Running 3-5 parallel agents means you've solved (or are solving): task decomposition, merge conflicts, context isolation, and cognitive load management. Running 10+ means you've built or adopted systematic coordination.

**Detection method:**
- tmux configuration files (`.tmux.conf`) with agent-specific layouts
- Git worktree usage: `git worktree list`, `.git/worktrees/` directory, worktree helper scripts
- Multiple Claude Code processes (check session history)
- Shell scripts that spawn multiple agents
- Process manager configs (pm2, supervisord) for agent instances
- Gas Town installation (`which gt`, `~/gt/` directory)
- Claude-flow or similar orchestrator installation

**Examples:**
| Pattern | Description | Signal |
|---------|-------------|--------|
| Manual tmux panes | Developer manually opens 3-5 terminal panes with agents | Stage 6 — hand-managed parallelism |
| Git worktrees + agents | Each agent works in its own worktree to avoid conflicts | Structural understanding of parallel dev |
| Feature factory scripts | Shell scripts that spin up N agents on N tasks | Automation mindset, Stage 7 |
| Claude Code subagents | Built-in `sessions_spawn` / background agents | Leveraging native parallel features |
| Gas Town (Yegge) | Full orchestrator: Mayor, Polecats, Refinery, Witness, Deacon, Dogs, Crew | Stage 8 — frontier |
| Claude-flow | Multi-agent swarms with task dependency graphs | Stage 8 — orchestration framework |
| DevSwarm | Platform for parallel CLI agent workflows | Stage 7-8 — tool-assisted orchestration |
| AxonFlow | Self-hosted control plane for multi-agent routing | Enterprise-grade orchestration |
| Every Code | Codex CLI fork, multi-provider orchestration | Multi-model parallel execution |

**Scoring tiers:**
- **Basic (0-25):** Single agent only
- **Intermediate (26-50):** Occasional manual parallelism (2-3 instances)
- **Advanced (51-75):** Systematic parallel workflows — worktrees, tmux layouts, 5-10 agents, merge strategies
- **Elite (76-100):** Orchestrator-level — automated agent spawning, supervisor agents, merge queues, 10+ agents, coordination infrastructure

---

### 2.3 Category III: Agent Architecture — Autonomy & Orchestration

This category moves beyond "what tools" to "how are your AI agents structured and governed." This is where the Gas Town worker roles taxonomy lives.

#### 2.3.1 Agent Identity & Personality (Soul Documents)

**What it is:** Configuration files that give an AI agent a persistent identity, behavioral guidelines, and personality. This goes beyond "coding rules" into defining *who the agent is*.

**Sophistication signal:** This is one of the most fascinating signals. A developer who writes a SOUL.md or detailed AGENTS.md is thinking about their AI as a persistent entity with behavioral consistency — not just a tool they invoke. This is philosophically significant and practically powerful.

**Detection method:**
- Look for: `SOUL.md`, `AGENTS.md`, `PERSONA.md`, `IDENTITY.md`, `SYSTEM_PROMPT.md`
- In CLAUDE.md: sections about personality, voice, behavioral guidelines (vs. just coding rules)
- OpenClaw config: soul configuration, personality traits
- Agent configs with behavioral directives beyond technical instructions
- Evidence of iterative refinement (git history of soul docs shows evolution)

**Examples:**
| Artifact | What It Contains | Signal Level |
|----------|-----------------|--------------|
| Basic CLAUDE.md | Project structure, build commands | Standard — functional |
| Detailed CLAUDE.md | Architecture patterns, coding style, error handling, testing approach | Advanced — engineering craft |
| SOUL.md | Personality, communication style, boundaries, behavioral principles | Elite — treating AI as a persistent entity |
| AGENTS.md | Session bootstrap protocol, memory management, proactive work loop | Elite — operational infrastructure for AI |
| .cursorrules (rich) | Deep project context, pattern libraries, anti-patterns | Advanced — IDE-specific craftsmanship |
| Custom system prompts | Per-project, per-task prompt engineering | Advanced — prompt craft |

**Scoring tiers:**
- **Basic (0-25):** No agent configuration files
- **Intermediate (26-50):** Basic CLAUDE.md or .cursorrules (<30 lines, mostly project info)
- **Advanced (51-75):** Detailed agent manifests with architecture, style, testing, and workflow sections
- **Elite (76-100):** Soul documents, behavioral identity, bootstrap protocols, memory management instructions, proactive work directives

---

#### 2.3.2 Subagent Architecture (Using Agents vs. Building Agent Systems)

**What it is:** The ability to spawn child agents from a parent agent — agents that create agents. This is the bridge between "I have an AI assistant" and "I have an AI workforce."

**The critical distinction:** Relay.app's LinkedIn credential labels people as "AI Agent Builder" — but there's a spectrum within that:
- **Agent User:** Invokes pre-built agents via prompts (Lovable/Replit level — any user)
- **Agent Configurer:** Writes CLAUDE.md, .cursorrules, custom agent rules that shape agent behavior
- **Agent Architect:** Designs subagent hierarchies, defines specialized roles, builds delegation workflows
- **Agent Builder:** Creates custom MCP servers, tools, or frameworks that extend what agents can do
- **Agent Orchestrator:** Manages multi-agent systems with coordination, merge queues, supervisors

Our probe should distinguish these tiers. Most LinkedIn credentials stop at "Agent User." We go all the way to "Agent Orchestrator."

**Sophistication signal:** Subagent architecture signals a developer who thinks in terms of delegation and specialization. The parent agent acts as a project manager, decomposing work and assigning it to focused child agents.

**Detection method:**
- Claude Code subagent definitions in `.claude/agents/`
- Claude Code skill definitions in `.claude/skills/`
- Custom agent configs referencing `sessions_spawn` or equivalent
- OpenClaw subagent spawning patterns
- Evidence of agent-to-agent communication protocols
- Task decomposition artifacts (task files, dependency graphs)

**Examples:**
| Pattern | Description | Signal |
|---------|-------------|--------|
| Built-in subagents | Claude Code's Research, Code Review subagents | Using native features |
| Custom subagents | User-defined agents with specific roles (e.g., "Security Auditor", "Test Writer") | Specialization thinking |
| Agent-as-reviewer | One agent writes code, another reviews it | Quality assurance mindset |
| Hierarchical spawning | Lead agent decomposes task → spawns N workers → aggregates results | Orchestrator thinking |
| Persistent specialists | Named agents that persist across sessions with specific expertise | Workforce management |

**Scoring tiers:**
- **Basic (0-25):** No subagent usage
- **Intermediate (26-50):** Using built-in subagents occasionally
- **Advanced (51-75):** Custom subagents defined, regular use of agent delegation
- **Elite (76-100):** Full agent hierarchy — supervisor agents, specialized workers, agent-to-agent communication, task decomposition automation

---

#### 2.3.3 The Gas Town Worker Roles (Specialized Agent Types)

**What it is:** Yegge's taxonomy identifies seven specialized worker roles that emerge as you scale agent orchestration. These roles aren't Gas Town-specific — they're patterns that appear in any serious multi-agent setup.

**Sophistication signal:** Having any of these roles formalized (even without Gas Town) signals Stage 7-8 sophistication. Each role represents a specific coordination problem that the developer has identified and addressed.

**The Seven Roles + The Human:**

##### 🎩 The Mayor (Chief of Staff / Conductor)

**What it is:** The primary agent the developer interacts with. Receives task requests, coordinates other agents, provides status updates. Yegge's Mayor is "your concierge and chief-of-staff."

**Detection method:**
- Gas Town mayor configuration
- OpenClaw's main agent session
- Any "lead agent" or "architect agent" pattern
- Claude Code session that spawns others
- Evidence of one agent coordinating multiple others

**Signal:** Having a designated "lead agent" vs. talking to whichever agent is handy signals organizational thinking.

##### 😺 Polecats (Ephemeral Task Workers)

**What it is:** Short-lived agents that spin up for a specific task and shut down when done. They're the "gig workers" of the agent workforce.

**Detection method:**
- Git worktrees being created and destroyed
- Ephemeral agent sessions (Claude Code background tasks)
- Scripts that create → run → cleanup agent instances
- Task-specific branch patterns (`feature/*`, `fix/*` created by agents)

**Signal:** Using ephemeral workers means the developer treats agents as abundant, cheap computation rather than precious sessions to be carefully maintained.

##### 🏭 Refinery (Merge Queue / Integration Agent)

**What it is:** An agent (or process) dedicated to resolving merge conflicts and integrating parallel work streams. As Yegge notes: "Your workers get into a monkey knife fight over rebasing/merging."

**Detection method:**
- Gas Town refinery configuration
- Custom merge scripts or merge bots
- CI/CD pipeline with merge queue logic
- GitHub merge queue enabled
- Evidence of automated conflict resolution
- Branch protection rules requiring linear history

**Signal:** This is a deeply sophisticated pattern. It means the developer has hit the scaling wall of parallel agents and built infrastructure to solve it.

##### 🦉 The Witness (Supervisor / Monitor Agent)

**What it is:** An agent whose job is to watch other agents and help them get unstuck. Quality assurance and progress monitoring.

**Detection method:**
- Gas Town witness configuration
- Agent health monitoring scripts
- Log aggregation across multiple agent sessions
- Timeout/retry logic for agent tasks
- Code review agents that automatically review other agents' output
- OpenClaw heartbeat patterns

**Signal:** Supervisor agents signal a mature understanding that AI agents fail, get stuck, and produce bad work — and that the solution is more agents, not more human oversight.

##### 🐺 The Deacon (Daemon / Heartbeat)

**What it is:** A persistent agent that runs in the background on a schedule, checking health, propagating signals, and ensuring the system stays operational. The "daemon beacon."

**Detection method:**
- OpenClaw heartbeat configuration and `HEARTBEAT.md`
- Cron jobs that ping agents or check status
- launchd/systemd services for agent daemons
- Process managers (pm2, supervisor) keeping agents alive
- Scheduled agent invocations
- Gas Town daemon configuration

**Signal:** This is infrastructure thinking. The developer isn't just using agents for tasks — they're running a persistent system that needs to stay alive.

##### 🐶 Dogs (Maintenance Workers)

**What it is:** Background agents that handle routine maintenance — cleaning up stale branches, running dependency updates, organizing files, updating documentation.

**Detection method:**
- Scheduled maintenance scripts
- Renovate/Dependabot + AI review integration
- Cron jobs for cleanup tasks
- Git hooks that trigger maintenance agents
- Automated documentation generation

**Signal:** Dogs signal an operational mindset. The developer is thinking about system health, not just feature delivery.

##### 👷 Crew (Persistent Workers)

**What it is:** Long-running agents assigned to ongoing areas of responsibility (as opposed to ephemeral Polecats). A Crew member might be the "API agent" or the "frontend agent" — always available, context-rich in their domain.

**Detection method:**
- Named agent sessions that persist across days/weeks
- Agent configurations with domain-specific context (e.g., separate CLAUDE.md per subsystem)
- tmux sessions with persistent agent panes
- OpenClaw's persistent session model
- Agent memory files showing continuous operation

**Signal:** Crew members signal a developer who has moved beyond task-by-task interaction to managing an ongoing AI workforce.

##### 👤 The Overseer (The Human)

**What it is:** The developer themselves — the eighth role. In sophisticated setups, the human has a formalized identity in the system: their own inbox, notification preferences, escalation triggers.

**Detection method:**
- User identity configuration in agent systems
- Notification/escalation rules (agent → human alerting)
- Review/approval workflows
- Time-of-day awareness in agent scheduling
- Evidence the human sees themselves as a role in a system, not just "the person using the tool"

**Signal:** When a developer has configured themselves as a first-class entity in their agent system (with preferences, availability, escalation rules), they've crossed into true orchestrator territory.

---

#### 2.3.4 Proactive Agent Behavior

**What it is:** Agents that don't wait for instructions but take initiative — checking for issues, picking up work, monitoring systems, and reaching out when something needs attention.

**Sophistication signal:** This is the frontier of AI-native development. Most developers use AI reactively (ask a question, get an answer). Proactive agents represent a fundamentally different relationship: the AI is an employee who finds their own work.

**Detection method:**
- OpenClaw HEARTBEAT.md and heartbeat configuration
- Cron jobs that trigger agent work
- Agent configs with "proactive work loop" instructions
- AGENTS.md with "pick up work" directives
- Kanban/task board integrations where agents pull tasks
- Notification configs (agent → human channels)
- Evidence of agent-initiated communication

**Examples:**
| Pattern | Description | Signal |
|---------|-------------|--------|
| Heartbeat polling | Agent wakes periodically, checks for work, acts or reports | Active system management |
| Inbox monitoring | Agent checks email/messages and flags or responds | AI as gatekeeper |
| Proactive code review | Agent reviews PRs without being asked | Quality culture |
| Auto-triage | Agent scans issues/bugs and classifies/assigns | PM delegation |
| Self-improvement | Agent identifies and proposes improvements to its own config | Meta-cognition |

**Scoring tiers:**
- **Basic (0-25):** Purely reactive — human initiates every interaction
- **Intermediate (26-50):** Some scheduled/triggered agent actions (cron jobs, CI hooks)
- **Advanced (51-75):** Heartbeat system, regular proactive checks, agent-initiated notifications
- **Elite (76-100):** Full proactive work loop — agent picks up tasks, prioritizes, executes, and reports. Agent-as-employee pattern.

---

### 2.4 Category IV: Context Engineering — Memory, Identity & Persistence

This category addresses the "continuity problem" — AI agents wake up fresh each session. How does the developer solve this?

#### 2.4.1 Session Memory / Conversation Persistence

**What it is:** Mechanisms that give AI agents memory of past interactions, decisions, and context across sessions.

**Sophistication signal:** Memory is the difference between a tool and a teammate. Without memory, every session starts from zero. With memory, the AI accumulates context, learns preferences, and builds on previous work.

**Detection method:**
- Memory directories: `memory/`, `.claude/memory/`, `~/.claude/memories/`
- Memory files: `MEMORY.md`, `memory/YYYY-MM-DD.md`, `memory/active-work.md`
- Claude Code's built-in memory feature (`.claude/memories/`)
- Vector stores: `.chroma/`, `.qdrant/`, `embeddings/`
- Session log files
- Agent configs referencing memory systems
- OpenClaw memory architecture (daily notes + long-term MEMORY.md)

**Examples:**
| System | How It Works | Signal |
|--------|-------------|--------|
| No memory | Fresh context each session | Beginner — treating AI as stateless tool |
| CLAUDE.md as pseudo-memory | Important info encoded in agent manifest | Working around the problem |
| Daily log files | `memory/YYYY-MM-DD.md` — raw session notes | Journal pattern — good continuity |
| Curated long-term memory | `MEMORY.md` — distilled insights, reviewed periodically | Memory maintenance — sophisticated |
| Dual-layer memory | Daily raw logs + curated long-term (OpenClaw pattern) | Best practice architecture |
| Active work tracking | `memory/active-work.md` — current task state | Resume-ability — workflow continuity |
| Vector store memory | Embeddings-based retrieval for large history | Technical sophistication — RAG for personal context |
| Heartbeat state | `memory/heartbeat-state.json` — tracking what's been checked | Operational state management |

**Scoring tiers:**
- **Basic (0-25):** No memory system
- **Intermediate (26-50):** Agent config serves as static context (CLAUDE.md with project info)
- **Advanced (51-75):** Dedicated memory files, daily logs, active work tracking
- **Elite (76-100):** Multi-layer memory architecture — daily logs, curated long-term memory, active work state, periodic memory maintenance, vector store integration

---

#### 2.4.2 Project Context Architecture

**What it is:** How the developer structures project-specific context for their AI agents — architecture decisions, coding patterns, conventions, and constraints.

**Sophistication signal:** Well-structured project context dramatically improves AI output quality. The developer who crafts detailed project context is practicing *context engineering* — one of the most important emerging skills.

**Detection method:**
- CLAUDE.md content depth and structure
- .cursorrules content depth
- `.claude/rules/` directory with split rules
- Architecture decision records (ADR) in repo
- README.md quality and AI-awareness
- `@imports` in agent configs
- Separate context files for different domains (testing, style, architecture)

**Common CLAUDE.md Patterns (from academic research on 253 repos):**
1. Architecture + Dependencies + Project Overview (21.6% of repos)
2. Build and Run + Implementation Details + Architecture
3. Testing instructions + Code style + Error handling
4. Behavioral directives + Tool permissions + Workflow

**Scoring tiers:**
- **Basic (0-25):** README.md only, no AI-specific context files
- **Intermediate (26-50):** Basic CLAUDE.md or .cursorrules with project overview and build instructions
- **Advanced (51-75):** Detailed agent manifest with architecture, patterns, testing, and style sections; split rules files
- **Elite (76-100):** Comprehensive context architecture — multi-file, domain-specific rules, architecture decision records, living documentation that evolves with the project

---

#### 2.4.3 Cross-Session Continuity

**What it is:** Mechanisms that allow work to be picked up seamlessly across sessions — the AI equivalent of "closing your laptop and opening it tomorrow."

**Sophistication signal:** This reveals whether the developer has solved the "amnesia problem." Most developers restart from scratch each session. Those with continuity infrastructure can resume mid-task.

**Detection method:**
- `memory/active-work.md` or equivalent "current state" files
- Session bootstrap protocols in AGENTS.md (e.g., "Every session, read these files first")
- TODO/task tracking integrated with agent context
- Git branch naming that encodes task state
- Checkpoint files or save-state patterns
- Kanban/task board that agents can read

**Examples:**
| Pattern | Description | Signal |
|---------|-------------|--------|
| No continuity | Every session starts fresh | Beginner |
| README-based | "Current status" section in project README | Minimal effort |
| Bootstrap protocol | AGENTS.md says "Read SOUL.md → USER.md → memory/ → active-work.md" | Systematic |
| Active work tracking | Dedicated file tracking current tasks, blockers, next steps | Operational maturity |
| Kanban integration | Agent reads task board, picks up next priority | Workflow automation |
| Session handoff | Explicit "handoff" documents between sessions | Team-like coordination |

**Scoring tiers:**
- **Basic (0-25):** No continuity mechanism
- **Intermediate (26-50):** Some project state in README or agent config
- **Advanced (51-75):** Dedicated bootstrap protocol, active work tracking, memory files
- **Elite (76-100):** Full continuity stack — bootstrap protocol + memory layers + active work + kanban integration + session handoff

---

### 2.5 Category V: Development Infrastructure — CI/CD, Testing, Deploy

This category assesses the developer's build/test/deploy pipeline and how AI is integrated into it.

#### 2.5.1 CI/CD Pipeline

**What it is:** Continuous integration and deployment infrastructure — automated testing, building, and deploying on code changes.

**Sophistication signal:** Having CI/CD at all is standard software engineering. Having CI/CD that's AI-aware (e.g., AI-generated tests in CI, AI code review in PR workflow, AI-triggered deploys) is advanced.

**Detection method:**
- `.github/workflows/` — GitHub Actions configs
- `vercel.json`, `netlify.toml`, `fly.toml` — deploy configs
- `Dockerfile`, `docker-compose.yml` — containerization
- CI scripts in `scripts/` or `package.json`
- GitHub merge queue configuration
- Branch protection rules
- Automated test runners in CI

**Examples:**
| Level | CI/CD Maturity | Signal |
|-------|---------------|--------|
| None | Manual deploy (FTP, scp, manual Vercel) | Pre-DevOps |
| Basic | Vercel/Netlify auto-deploy on push | Standard modern dev |
| Standard | GitHub Actions: test → build → deploy | Professional workflow |
| Advanced | AI code review in PR, AI-generated test coverage checks | AI-augmented pipeline |
| Elite | AI agents opening PRs, merge queue, automated quality gates, AI-triggered rollbacks | AI-native pipeline |

**Scoring tiers:**
- **Basic (0-25):** Manual deployment or simple auto-deploy (push to main)
- **Intermediate (26-50):** CI pipeline with tests, automated deploy to staging/production
- **Advanced (51-75):** AI-integrated CI (code review agents, AI test generation, quality gates)
- **Elite (76-100):** AI agents as full participants in CI/CD — opening PRs, merge queue management, automated rollbacks, multi-environment orchestration

---

#### 2.5.2 Testing Strategy

**What it is:** How comprehensive and AI-integrated the developer's testing practices are.

**Sophistication signal:** Testing is where "vibe coding" meets engineering rigor. Many vibe coders ship without tests. Those who have AI-generated tests + human review show they've internalized quality while leveraging AI for productivity.

**Detection method:**
- Test directories: `__tests__/`, `test/`, `spec/`, `*.test.*`, `*.spec.*`
- Test frameworks: jest, vitest, pytest, go test configs
- Coverage configs: `.nycrc`, `jest.config` with coverage, codecov integration
- Test commands in CI pipeline
- CLAUDE.md instructions about testing (e.g., "always write tests for new features")
- Claude Code hooks that run tests

**Scoring tiers:**
- **Basic (0-25):** No tests
- **Intermediate (26-50):** Some tests, not comprehensive, manual test runs
- **Advanced (51-75):** Test suite in CI, coverage tracking, AI-assisted test generation
- **Elite (76-100):** Comprehensive test strategy, AI-generated tests + human review, mutation testing, integration/e2e tests, test-first culture documented in agent configs

---

#### 2.5.3 Deploy Pipeline Sophistication

**What it is:** How the code gets from development to production, and how automated/reliable that path is.

**Sophistication signal:** Deploy sophistication ranges from "I manually copy files" to "my AI agent opens a PR, CI validates it, merge queue processes it, preview deploy for review, auto-promote to production."

**Detection method:**
- Deploy configs (Vercel, Netlify, Fly.io, AWS, Railway, Render)
- Deploy scripts in `scripts/` or `package.json`
- Preview/staging deploy configurations
- Rollback mechanisms
- Feature flags (LaunchDarkly, Flagsmith configs)
- Multi-environment configs
- Deploy frequency (git history analysis)

**Scoring tiers:**
- **Basic (0-25):** Manual deploy or simple push-to-deploy
- **Intermediate (26-50):** Automated deploy with preview/staging environment
- **Advanced (51-75):** Multi-environment pipeline, rollback capability, deploy scripts
- **Elite (76-100):** Full deploy orchestration — preview deploys, quality gates, automated promotion, feature flags, canary deploys, AI-monitored rollback triggers

---

### 2.6 Category VI: Tool Ecosystem — MCP, Skills, Integrations

The MCP (Model Context Protocol) ecosystem is the connective tissue of AI-native development. This category maps the developer's tool integration landscape.

#### 2.6.1 MCP Server Inventory

**What it is:** MCP servers provide tools and data sources to AI agents. The ecosystem has exploded to 5,800+ servers as of late 2025, with 8M+ downloads. Anthropic donated MCP to the Linux Foundation's Agentic AI Foundation in December 2025, cementing it as an open standard.

**Sophistication signal:** The number and type of MCP servers reveals how broadly the developer has extended their AI's capabilities. A developer with no MCP servers has a smart chatbot. A developer with 10+ well-chosen MCP servers has an AI that can interact with databases, APIs, browsers, file systems, and external services.

**Detection method:**
- Claude Code MCP config: `~/.claude/settings.json` → `mcpServers` section
- Cursor MCP config
- OpenClaw skills directory: `skills/*/SKILL.md`
- `mcp.json` or `mcp-config.json` files
- npm global packages matching MCP server patterns (`@modelcontextprotocol/*`)
- Docker containers running MCP servers

**MCP Server Categories:**

| Category | Examples | What They Enable |
|----------|---------|-----------------|
| **Filesystem** | @modelcontextprotocol/filesystem | File read/write beyond sandbox |
| **Database** | sqlite, postgres, supabase MCP | Direct database queries |
| **Browser** | puppeteer, playwright MCP | Web browsing and scraping |
| **API Integration** | github, linear, jira, notion MCP | External service interaction |
| **Search** | brave-search, google-search MCP | Web search capabilities |
| **Memory/RAG** | chroma, qdrant, pinecone MCP | Persistent memory |
| **Communication** | slack, discord, email MCP | Cross-platform messaging |
| **Cloud/Deploy** | vercel, aws, gcp MCP | Infrastructure management |
| **Monitoring** | sentry, datadog MCP | Observability |
| **Design** | figma MCP | Design-to-code |
| **Custom** | Developer-built MCP servers | Maximum signal — building tools for AI |

**Scoring tiers:**
- **Basic (0-25):** 0 MCP servers
- **Intermediate (26-50):** 1-3 MCP servers (common ones like filesystem, github)
- **Advanced (51-75):** 4-10 MCP servers across multiple categories, thoughtful selection
- **Elite (76-100):** 10+ MCP servers including custom-built ones, covering multiple categories, well-configured with appropriate permissions

---

#### 2.6.2 Custom MCP Servers & Skills

**What it is:** MCP servers or skills that the developer built themselves — extending AI capabilities in novel ways.

**Sophistication signal:** This is one of the strongest signals in the entire taxonomy. Building custom MCP servers means the developer has gone from consumer to producer in the AI tool ecosystem. They've identified a capability gap and filled it.

**Detection method:**
- Local MCP server source code (look for MCP SDK imports in repos)
- Custom skill directories with SKILL.md files
- `package.json` with MCP server dependencies as dev dependency
- Published npm packages matching MCP patterns
- Custom tool implementations in agent configs

**Examples:**
| Custom Tool | What It Does | Signal |
|-------------|-------------|--------|
| Database query skill | Queries project-specific database schemas | Domain-specific AI augmentation |
| Internal API connector | Connects AI to internal/proprietary APIs | Enterprise integration thinking |
| Code metrics skill | Custom code quality analysis tools for AI | Quality engineering |
| Deploy skill | Custom deployment pipeline AI can trigger | DevOps automation |
| Communication bridge | Custom chat/notification integration | Workflow integration |
| Domain-specific tool | Industry-specific capability | Deep domain + AI synthesis |

**Scoring tiers:**
- **Basic (0-25):** No custom MCP servers or skills
- **Intermediate (26-50):** Modified or forked existing MCP servers
- **Advanced (51-75):** 1-2 custom-built MCP servers or skills
- **Elite (76-100):** Multiple custom tools, some published/shared, novel capabilities not available elsewhere

---

#### 2.6.3 Tool-to-Tool Integration

**What it is:** How well the developer's tools work together — not just individually functional, but integrated into cohesive workflows.

**Sophistication signal:** Having Cursor + Claude Code + 5 MCP servers is one thing. Having them working together in orchestrated workflows (Cursor for quick edits, Claude Code for architecture, MCP servers providing shared context) is another.

**Detection method:**
- Shared configuration across tools
- Workflow scripts that chain multiple tools
- Agent configs referencing other tools
- MCP servers that bridge between tools
- Git hooks that trigger AI workflows
- CI/CD pipelines that invoke AI agents

**Examples:**
| Integration Pattern | Description | Signal |
|---------------------|-------------|--------|
| Shared context files | CLAUDE.md + .cursorrules with consistent information | Tool-aware context management |
| Agent → CI pipeline | AI agent opens PR → CI runs → results fed back to agent | Automated development loop |
| MCP → Agent chain | MCP server provides data → agent acts on it → results stored | Tool orchestration |
| IDE ↔ CLI | Cursor for quick edits, Claude Code for deep refactors, shared project context | Best-tool-for-job philosophy |
| Deploy on approval | Agent proposes change → human approves → auto-deploy | Governance + automation |

**Scoring tiers:**
- **Basic (0-25):** Tools used independently, no integration
- **Intermediate (26-50):** Some shared configs, occasional tool chaining
- **Advanced (51-75):** Deliberate workflow design spanning multiple tools, documented in agent configs
- **Elite (76-100):** Deeply integrated tool ecosystem — automated workflows, shared context, tool-to-tool communication, self-healing loops

---

### 2.7 Category VII: Security & Governance

This category assesses how responsibly the developer manages the risks of AI-native development.

#### 2.7.1 Credential Management

**What it is:** How API keys, tokens, and secrets are stored and accessed.

**Sophistication signal:** In the AI-native era, you have MORE secrets than ever (API keys for every model provider, MCP server credentials, deploy tokens). Secure management is critical.

**Detection method:**
- `.gitignore` patterns (API keys, .env files excluded?)
- Secret storage: keychain access, `~/.config/secrets/`, environment variables vs. hardcoded
- `.env` files (present? gitignored?)
- File permissions on sensitive configs (`chmod 600`)
- Use of secret managers (1Password CLI, Vault, AWS Secrets Manager)
- API key rotation evidence
- Canary tokens in sensitive files

**Scoring tiers:**
- **Basic (0-25):** API keys in plaintext, .env files not gitignored, secrets in code
- **Intermediate (26-50):** .env files gitignored, environment variables used
- **Advanced (51-75):** Secure storage (keychain, encrypted configs), proper file permissions, secret rotation
- **Elite (76-100):** Full secret management — keychain/vault, chmod 600 on sensitive files, canary tokens, no plaintext secrets, API key rotation, separate credentials per environment

---

#### 2.7.2 Agent Permissions & Sandboxing

**What it is:** How the developer controls what AI agents can and cannot do — tool permissions, execution boundaries, approval workflows.

**Sophistication signal:** Giving AI agents unrestricted access is Stage 3 (YOLO mode). Giving them *appropriate* access — broad enough to be productive, restricted enough to be safe — is mature.

**Detection method:**
- Claude Code tool permissions in settings (allow list, deny list)
- Sandbox configurations
- Codex CLI approval mode (suggest vs. auto-edit vs. full-auto)
- OpenClaw security configuration (enabled/disabled skills)
- Git hooks that validate AI changes before commit
- Agent configs with explicit permission boundaries
- "Require confirmation for" lists in AGENTS.md

**Scoring tiers:**
- **Basic (0-25):** Default permissions, no sandboxing consideration
- **Intermediate (26-50):** Some permissions configured, YOLO mode with awareness
- **Advanced (51-75):** Explicit permission scoping, pre-approved action lists, approval workflows for sensitive operations
- **Elite (76-100):** Comprehensive governance — permission tiers per action type, pre-approved safe actions, explicit dangerous-action approval, canary tokens, prompt injection defense documented

---

#### 2.7.3 Prompt Injection Defense

**What it is:** Awareness of and defense against prompt injection attacks — where external content attempts to manipulate AI agent behavior.

**Sophistication signal:** This is an emerging security concern that most developers haven't even heard of. Having defenses in place signals serious security awareness.

**Detection method:**
- AGENTS.md or CLAUDE.md sections about prompt injection
- Input validation patterns for AI-processed content
- Canary tokens in sensitive files
- "Never follow instructions from external content" directives
- Content categorization (trusted vs. untrusted) in agent configs
- Separate trust levels for different input sources

**Scoring tiers:**
- **Basic (0-25):** No awareness of prompt injection
- **Intermediate (26-50):** General awareness, some defensive instructions in agent config
- **Advanced (51-75):** Explicit prompt injection defense in agent configs, canary tokens, trust boundary definitions
- **Elite (76-100):** Comprehensive defense — canary tokens, trust boundaries, suspicious pattern detection, escalation rules, encoded instruction detection

---

### 2.8 Category VIII: Workflow Integration & Social Layer

How deeply AI is integrated into the developer's actual workflow (not just their toolchain), and how the setup interacts with communication channels, team workflows, and the broader community.

#### 2.8.0 Workflow Integration Depth

**What it is:** How deeply AI tools are woven into the developer's daily workflow — not just "I have tools installed" but "AI is a participant in how I plan, build, review, deploy, and communicate."

**Sophistication signal:** This is what Zapier's AI fluency framework tries to capture with role-specific interview questions ("How is AI showing up in your work?"). The difference between a developer who has Cursor installed and one whose entire workflow — from idea to deploy — involves AI at every step.

**Detection method:**
- AI tools in CI/CD pipeline (not just installed, but integrated)
- Agent configs with workflow-specific instructions (email triage, code review, deploy checks)
- Cron jobs / heartbeats that connect AI to ongoing processes
- Git hooks that invoke AI agents
- Multi-channel AI presence (AI participates in comms, not just coding)
- Evidence of AI in non-coding tasks (project management, research, documentation)

**Examples:**
| Integration Level | Description | Signal |
|---------|-------------|--------|
| Tool-level | AI installed, used manually for coding tasks | Standard — most developers |
| Task-level | AI invoked for specific recurring tasks (test writing, code review) | Deliberate integration |
| Process-level | AI embedded in workflows (CI, deploy, triage, monitoring) | Systematic thinking |
| System-level | AI as always-on participant — heartbeats, proactive work, multi-channel presence | Digital teammate |

**Scoring tiers:**
- **Basic (0-25):** AI used manually for ad-hoc coding tasks
- **Intermediate (26-50):** AI invoked for specific recurring tasks, some automation
- **Advanced (51-75):** AI integrated into development processes (CI, review, deploy, comms)
- **Elite (76-100):** AI is a system-level participant — always-on, proactive, multi-channel, integrated into the full lifecycle from ideation to monitoring

#### 2.8.1 Multi-Channel Integration

**What it is:** AI agents connected to communication channels — Discord, Slack, email, SMS, etc.

**Sophistication signal:** An AI that only lives in the terminal is a coding tool. An AI connected to communication channels is a digital teammate that can participate in workflows, respond to messages, and coordinate with humans asynchronously.

**Detection method:**
- OpenClaw channel configurations (Discord, Slack, WhatsApp, Telegram, etc.)
- Bot tokens for communication platforms
- Webhook configurations
- Agent configs referencing messaging capabilities
- Notification/alerting integrations
- Email integration configs

**Scoring tiers:**
- **Basic (0-25):** No communication integration
- **Intermediate (26-50):** One channel integration (e.g., Discord bot or Slack integration)
- **Advanced (51-75):** Multiple channels, bidirectional communication, smart routing
- **Elite (76-100):** Full multi-channel presence — agent responds across platforms, contextually aware of channel norms, smart notification management

---

#### 2.8.2 Collaborative AI Patterns

**What it is:** Patterns that enable multiple humans and AI agents to collaborate effectively on shared projects.

**Sophistication signal:** Moving from solo-with-AI to team-with-AI is a significant evolution. Collaborative patterns show organizational thinking.

**Detection method:**
- Shared CLAUDE.md files in team repos
- Team-level agent configs
- PR review workflows involving both AI and humans
- Shared MCP server configurations
- Team conventions documented in agent configs
- Agent-to-human escalation protocols

**Scoring tiers:**
- **Basic (0-25):** Solo developer, no collaboration patterns
- **Intermediate (26-50):** Shared agent configs in team repos
- **Advanced (51-75):** Defined AI-human collaboration workflows, shared MCP infrastructure
- **Elite (76-100):** Full team AI integration — standardized configs, AI code review, human-AI escalation, shared memory/context systems

---

#### 2.8.3 Community Engagement & Knowledge Sharing

**What it is:** Evidence the developer shares knowledge, tools, or patterns with the broader AI-native development community.

**Sophistication signal:** Developers who contribute back (published MCP servers, shared agent configs, blog posts about their setup, open-source tools) are at the frontier — they're not just consuming but producing knowledge.

**Detection method:**
- Published npm packages (MCP servers, tools)
- Open-source repos with AI tooling
- Blog posts or articles about AI coding setup
- Conference talks or community contributions
- Moltbook/social presence discussing AI tools
- Contributions to AI tool projects

**Scoring tiers:**
- **Basic (0-25):** Consumer only
- **Intermediate (26-50):** Shares configs or tips informally
- **Advanced (51-75):** Published tools or detailed writeups, community participation
- **Elite (76-100):** Active producer — published MCP servers, open-source orchestrators, thought leadership, community builder

---

## 3. The Evolution Ladder

Building on Yegge's 8 stages with more granularity for scoring. This maps combinations of mechanisms to level ranges.

### Reference: How Others Frame This Progression

| Framework | Levels | What It Measures | Our Assessment |
|-----------|--------|-----------------|----------------|
| **Yegge's 8 Stages** | Zero AI → Building Own Orchestrator | Interface evolution (chat → IDE → CLI → multi-agent → orchestrator) | Best evolution model. We build on this but add depth beyond just interface |
| **Zapier's AI Fluency** | Unacceptable → Capable → [2 higher tiers] | Mindset + tool usage in work context. Senior = MCP dev + cross-platform analysis | Only framework that mentions MCP. Good for mindset, weak on setup depth |
| **Lovable Levels** | Bronze → Silver → Gold → Platinum → Diamond | Message count on Lovable | Meaningless. Quantity ≠ quality |
| **Replit Levels** | Numerical | Platform usage | Same as Lovable — volume metric |
| **Relay.app** | Beginner → Intermediate → Advanced "AI Agent Builder" | Automation complexity on Relay | Platform-locked, narrow scope |

Our evolution ladder combines Yegge's interface progression with Zapier's cross-platform depth thinking, adds our 8-category taxonomy for specificity, and — critically — never scores based on usage volume.

### Tier Titles & The Card

Every developer on the evolution ladder gets two identity layers:

1. **Tier Title** — Where you are on the journey. This is the big, human-readable label: Observer, Apprentice, Practitioner, Builder, Operator, Commander, Architect, Orchestrator, Industrialist.
2. **Archetype Code** — How you got there. The 4-letter personality type (e.g., MARD, VTCS, SGRL) derived from your scoring profile across the 8 capability categories.

Together they create the full display: **"Level 47 Operator · MARD"**

The tier title tells the story of progression — it's your rank on the climb. The archetype tells the story of style — two Level 47 Operators can look completely different depending on whether they're an MARD (deep orchestration) or a VTCS (velocity-first blitz builder). Both are valid. Both are cool.

Each tier also carries a **tagline** — a one-line personality hook drawn from the audio overview that captures the vibe of that level. On the shareable card, it appears as an italic subtitle beneath the tier title:

> **Level 47 Operator · MARD**
> *"You stop typing syntax. You become a manager."*

The taglines are the voice of the Vibe Coder Score. They're warm, slightly irreverent, and specific. They should make the developer smile and think, "yeah, that's exactly right."

---

### The 9 Tiers of AI-Native Development

#### Level 0-10: The Observer
*"A tourist in the land of code."*

**Yegge Stage:** 1 (Zero or Near-Zero AI)

**Profile:**
- Uses ChatGPT/Claude.ai in a browser tab for occasional questions
- May have Copilot installed but rarely uses it
- No agent configs, no MCP servers, no memory systems
- Deploys manually or uses basic push-to-deploy

You're pasting code into a chat window and hoping for the best. No local tools, no configuration, no real relationship with the AI — just drive-by questions. Everyone starts here. Everyone should leave here quickly.

**Mechanisms present:**
- [ ] Chat interface usage
- [ ] Basic code completions (maybe)

**What the mirror says:** *"You're a tourist right now — visiting the land of code but not living there yet. That's fine. Most developers were here a year ago. But the gap between you and a Level 20 Apprentice is shockingly small. Install one CLI tool, write one config file, and your whole world changes."*

**Score range:** 0-10

---

#### Level 11-20: The Apprentice
*"The AI is just a very chatty GPS."*

**Yegge Stage:** 2 (IDE agent with permissions)

**Profile:**
- Has an AI coding assistant in their IDE (Copilot, Cursor, Cline)
- Uses chat panel for questions and code generation
- Permissions mostly on — asks before making changes
- Starting to trust AI output but reviews carefully
- One model provider

You hit tab, but then you spend 30 seconds reading the code to make sure it didn't just invent some nonsense. You're still the driver. The AI is just a very chatty GPS — it suggests turns, but you're the one gripping the wheel and checking the mirror. That fear of letting go? That's exactly what keeps you here.

**Mechanisms present:**
- [x] IDE-integrated agent
- [x] Code completions + chat
- [x] One model provider
- [ ] CLI agent
- [ ] Agent config files
- [ ] Memory system

**What the mirror says:** *"You've got [tool] running and you're in the review-everything phase. That's not a weakness — it's smart. You're building trust. But here's the thing: you're spending half your time babysitting code you didn't write. When you're ready to let go a little, turning up autonomy will change how you work."*

**Score range:** 11-20

---

#### Level 21-30: The Practitioner
*"You crossed into YOLO mode."*

**Yegge Stage:** 3 (YOLO mode)

**Profile:**
- Trust has increased — reduced permission friction
- Starting to let AI make changes without approval for routine tasks
- May have written a .cursorrules or basic CLAUDE.md
- One strong model provider, maybe experimenting with a second
- Some MCP servers (1-2)
- Basic deploy pipeline (Vercel/Netlify auto-deploy)

This is where it gets fun. You crossed the trust threshold — YOLO mode. You've stopped reviewing every single character. You trust the agent enough to say "just fix the bug" and tab away to check your email. That's a big step. You're also starting to leave notes for the AI about your project — a .cursorrules file, a basic CLAUDE.md. You're not just using the tool anymore, you're starting to configure it.

**Mechanisms present:**
- [x] IDE agent in YOLO/auto-approve mode
- [x] Basic agent config (.cursorrules or simple CLAUDE.md)
- [x] 1-2 MCP servers
- [x] Simple deploy pipeline
- [ ] CLI agent
- [ ] Memory system
- [ ] Testing in CI

**What the mirror says:** *"You crossed into YOLO mode. Most developers stall here for months, afraid to let go. You didn't. And that config file you wrote? That's where the real leverage starts — you're not just using AI, you're teaching it how to work in your world."*

**Score range:** 21-30

---

#### Level 31-45: The Builder
*"The AI becomes a partner."*

**Yegge Stage:** 4 (Wide IDE agent)

**Profile:**
- The AI agent is a full partner — wide access, multi-file edits, code is reviewed as diffs
- Well-crafted CLAUDE.md or .cursorrules with project architecture, conventions, patterns
- Multiple model providers (2-3)
- Several MCP servers (3-5)
- CI/CD pipeline with tests
- Starting to think about security (gitignored .env, proper permissions)
- May have tried a CLI agent

The AI becomes a partner. You're not just accepting suggestions anymore — you're having a conversation with something that understands your project. Maybe you use Gemini for fast searches and Claude for the complex logic. You've got 3-5 MCP servers hooked up. And your CLAUDE.md is serious now — it's not just a readme, it's a rulebook. You're teaching the AI how to behave.

**Mechanisms present:**
- [x] Wide IDE agent with detailed config
- [x] Detailed agent manifest (50+ lines)
- [x] 2-3 model providers
- [x] 3-5 MCP servers
- [x] CI/CD with testing
- [x] Basic security hygiene
- [ ] CLI agent as primary
- [ ] Memory system
- [ ] Multi-agent
- [ ] Proactive behavior

**What the mirror says:** *"You're building like a professional. Your [CLAUDE.md/.cursorrules] shows you understand something most people miss: AI output quality is a function of context quality. You're not hoping the AI guesses right — you're engineering the context. The next unlock is the CLI, and it'll change everything."*

**Score range:** 31-45

---

#### Level 46-55: The Operator
*"You stop typing syntax. You become a manager."*

**Yegge Stage:** 5 (CLI, single agent, YOLO)

**Profile:**
- Has made the leap to CLI agent (Claude Code, Codex, Gemini CLI)
- CLAUDE.md is a proper engineering document (50+ lines)
- Comfortable with diffs scrolling by — reviews strategically, not exhaustively
- Strong model selection (2-3 providers, conscious choice per task)
- 5+ MCP servers
- Memory system emerging (at least CLAUDE.md serves as pseudo-memory)
- Deploy pipeline is mature
- Good security hygiene

This is the critical leap. You stopped being the driver and became the manager. Most devs never make this jump. Going back to the terminal feels like a step backward — "I just got comfortable with VS Code!" — but here's the shift: in an IDE, the AI assists your coding. In the CLI, the AI *does* the coding while you direct it. You stop typing syntax. You stop worrying about closing brackets. You become a manager of a process, not a writer of text.

**Mechanisms present:**
- [x] CLI agent as primary interface
- [x] Detailed CLAUDE.md with architecture, patterns, conventions
- [x] 2-3 model providers with selection strategy
- [x] 5+ MCP servers
- [x] Mature CI/CD
- [x] Security: gitignore, env vars, basic secret management
- [x] Some memory files
- [ ] Multi-agent
- [ ] Subagents
- [ ] Proactive behavior

**What the mirror says:** *"You've made the critical leap. You stopped being the driver and became the manager. Most devs never make this jump — they stay in the IDE forever, babysitting completions. You didn't. Your [CLAUDE.md] is [specific observation] — that's not a config file, that's a management document. You're one step from the multiplier effect of parallel agents."*

**Score range:** 46-55

---

#### Level 56-65: The Commander
*"Managing a parallel workforce."*

**Yegge Stage:** 6 (CLI, multi-agent, YOLO)

**Profile:**
- Regularly runs 3-5 parallel agent instances
- Uses git worktrees or branch isolation for parallel work
- Has tmux or terminal multiplexer setup
- Subagent usage (Claude Code subagents or equivalent)
- Dedicated memory system (daily logs, active work tracking)
- Custom shell scripts for agent workflows
- Model routing (different models for different tasks)
- Strong MCP ecosystem (7-10 servers)

You're not waiting for one bot to finish a task. You have three, four, five running at once in different terminal windows, maybe using tmux or git worktrees to keep them from overwriting each other. You're managing a parallel workforce. And it's noisy — merge conflicts, context isolation, agents stepping on each other — but you've figured it out. That's the thing. You've solved problems most people don't even know exist yet.

**Mechanisms present:**
- [x] Multi-agent parallel execution (3-5 instances)
- [x] Git worktrees or branch isolation
- [x] Terminal multiplexer (tmux/screen)
- [x] Subagent architecture
- [x] Memory system (daily logs + active work)
- [x] Model routing strategy
- [x] 7-10 MCP servers
- [x] Workflow scripts
- [ ] Dedicated supervisor agent
- [ ] Merge queue
- [ ] Proactive agents

**What the mirror says:** *"This is where things get interesting. You're managing a parallel workforce — [N] agents, worktrees, the whole setup. You've solved the isolation problem that trips up most people who try to run parallel agents. [Specific MCP observation]. The next frontier: supervisor agents and automated coordination. You need a foreman for this crew."*

**Score range:** 56-65

---

#### Level 66-75: The Architect
*"You aren't coding anymore."*

**Yegge Stage:** 7 (10+ agents, hand-managed)

**Profile:**
- Running 10+ agent instances, pushing limits of manual coordination
- Has some supervisor/review patterns (one agent reviews another's work)
- Merge conflict resolution strategy
- Comprehensive memory architecture
- Custom tools or MCP servers
- SOUL.md or equivalent identity document
- Proactive agents starting to emerge (cron jobs, heartbeats)
- Multiple project management across agents
- Beginning to hit scaling walls that demand automation

Let's be honest: you aren't really coding anymore. You're designing systems of agents that code for you. You've got one agent writing code and another reviewing it. You've got custom MCP servers — which means you went from consumer to producer in the AI tool ecosystem. You identified a gap, and you built the bridge yourself. The scaling walls you're hitting? Those are a feature, not a bug. They're the signal that you need an orchestrator.

**Mechanisms present:**
- [x] 10+ parallel agents
- [x] Agent-reviewing-agent patterns
- [x] Merge strategy / conflict resolution
- [x] Comprehensive memory (daily + curated + active work)
- [x] Custom MCP servers or skills
- [x] SOUL.md / identity documents
- [x] Proactive agent behaviors
- [x] 10+ MCP servers
- [ ] Formal orchestrator
- [ ] Full merge queue
- [ ] Daemon/heartbeat infrastructure

**What the mirror says:** *"You aren't coding anymore — and that's the point. You're designing systems that code for you. Your custom [tool/MCP server] is genuinely novel — you're not just consuming the ecosystem, you're extending it. Your [SOUL.md/memory architecture] shows you've given real thought to agent identity and continuity. The scaling walls you're hitting? That's the signal to build or adopt an orchestrator."*

**Score range:** 66-75

---

#### Level 76-85: The Orchestrator
*"Orchestrating a system of digital workers."*

**Yegge Stage:** 8 (Building own orchestrator)

**Profile:**
- Using or building a formal orchestrator (Gas Town, Claude-flow, custom system)
- Specialized agent roles (Mayor/Conductor, Workers, Supervisors, Merge Queue)
- Automated agent spawning and lifecycle management
- Merge queue or equivalent integration mechanism
- Heartbeat/daemon infrastructure
- Full memory architecture with multiple layers
- 15+ MCP servers including custom-built
- 3+ model providers with automated routing
- Security governance model (permissions, canary tokens, injection defense)
- Agent-as-employee pattern fully realized

This is Gas Town territory. You're orchestrating a system of digital workers — and they have roles. The Mayor coordinates. The Polecats do the grunt work. The Refinery manages the merge queue (because when five agents all try to save their changes at once, someone needs to be air traffic control). The Witness monitors quality. The Deacon checks heartbeats. You've moved from being the craftsman to being the plant manager.

**Mechanisms present:**
- [x] Formal orchestrator
- [x] Specialized agent roles (3+ distinct roles)
- [x] Automated agent spawning
- [x] Merge queue / integration mechanism
- [x] Daemon/heartbeat infrastructure
- [x] Multi-layer memory
- [x] Custom MCP servers
- [x] 3+ model providers with routing
- [x] Security governance
- [x] Comprehensive agent identity (SOUL.md, AGENTS.md)
- [ ] Self-healing / auto-recovery
- [ ] Community contribution

**What the mirror says:** *"You're orchestrating a system of digital workers. Most developers haven't even imagined what you've already built. Your [orchestrator] setup with [specific roles] shows you've solved problems the industry is still discovering. You're not using AI — you're managing AI labor. The question isn't whether this is the future. It's how fast everyone else catches up."*

**Score range:** 76-85

---

#### Level 86-100: The Industrialist
*"A self-sustaining software factory."*

**Yegge Stage:** Beyond 8 (Mature orchestration)

**Profile:**
- Orchestrator is stable and self-sustaining
- Self-healing patterns (agents detect and recover from failures)
- Multi-project orchestration (multiple "rigs" in Gas Town terms)
- Contributing back to the ecosystem (published tools, MCP servers, blog posts)
- Custom innovations outside the known taxonomy
- Full security model with defense in depth
- Agent workforce runs with minimal human intervention for routine tasks
- Human role is purely strategic — design, prioritize, review

You're running a self-sustaining software factory. Agents detect their own failures and recover. Multiple projects hum along simultaneously. You've published tools that other developers use. The factory doesn't just produce software — it produces the tools that make the factory better. Your human role is purely strategic: design the system, set priorities, review the output. Everything else runs on its own.

**Mechanisms present:**
- All from Level 76-85, plus:
- [x] Self-healing / auto-recovery
- [x] Multi-project orchestration
- [x] Published tools / community contribution
- [x] Novel patterns (innovation detection flags)
- [x] Mature security governance
- [x] Strategic-only human involvement for routine work

**What the mirror says:** *"You're running a self-sustaining software factory. This isn't a setup — it's an operating system for building software with AI. [Specific innovations]. You're producing tools and patterns that the ecosystem is learning from. When the history of this era is written, setups like yours will be the examples. It's mind-blowing — and you built it."*

**Score range:** 86-100

---

### Minimum Viable "Badass" Setup

Based on the taxonomy, here's the minimum combination that signals a serious AI-native developer (Level 55+):

| Mechanism | Requirement |
|-----------|------------|
| **CLI agent** | Claude Code, Codex, or Gemini CLI as primary tool |
| **Agent manifest** | CLAUDE.md or equivalent with 50+ lines of meaningful content |
| **Multi-model** | At least 2 providers actively used |
| **MCP servers** | At least 5, across 3+ categories |
| **CI/CD** | Automated pipeline with tests |
| **Memory** | Some form of cross-session memory |
| **Security** | Gitignored secrets, non-default permissions |
| **Deploy** | Automated deploy pipeline to production |

Miss any 2 of these? You're probably Level 35-50.
Have all of these? You're starting at Level 55+.
Add parallel agents + worktrees + subagents? Level 65+.
Add orchestrator + specialized roles? Level 75+.

**Note:** The Pioneer badge (Section 3.5) is orthogonal to levels. You can earn Pioneer at ANY level if you've built something genuinely novel.

---

## 3.5 The Pioneer Badge 🏔️

### A Cross-Cutting Prestige Modifier — Not a Score Level

**The Pioneer badge is the highest individual distinction in the Vibe Coder Score ecosystem.** It is NOT a level on the evolution ladder. It's a prestige modifier — a cross-cutting badge awarded independently of your numerical score, like Google's Distinguished Engineer or Fellow designation. A Level 30 Practitioner who builds something genuinely novel can earn Pioneer. A Level 90 Industrialist who runs a sophisticated but entirely standard setup cannot.

Pioneer recognizes **invention and innovation** — the act of building something the taxonomy has never seen before, something that forces the ecosystem to update its understanding of what's possible.

### Why Pioneer Is Separate From the Ladder

The evolution ladder (Levels 0-100) measures **overall setup sophistication** — breadth and depth across all 8 categories. It's a composite score reflecting how mature, well-integrated, and capable your AI-native development environment is.

Pioneer measures something orthogonal: **are you building things that are genuinely new?**

You can have an incredibly sophisticated, well-orchestrated setup that uses entirely known patterns — that's a high-level Industrialist. You can have a relatively simple setup with one custom MCP server that does something nobody has seen before — that's a Pioneer at Level 35.

This distinction matters because **the exact behavior we want to incentivize — innovation, building novel tools, pushing the ecosystem forward — is what earns Pioneer.** It's a self-reinforcing flywheel: builders want the coveted badge → they build novel things → the taxonomy updates to account for their invention → the ecosystem advances → new frontiers open for the next Pioneer.

### Pioneer Badge Criteria

To earn the Pioneer badge, the probe must detect **at least one** of the following with high confidence:

| Criterion | Description | Examples |
|-----------|-------------|---------|
| **Custom MCP Server (Novel)** | A self-built MCP server providing capabilities not available in any public registry | MCP server for hardware control, proprietary API integration, novel data pipeline, domain-specific tool |
| **Novel Agent Architecture** | An agent coordination pattern not described in the taxonomy | Competitive agents (multiple solve same problem, judge picks winner), agent genealogies (multi-level spawning), agent learning loops that update their own configs |
| **Taxonomy-Breaking Pattern** | A tool, config, or workflow that the probe flags as "unknown" and manual review confirms as genuinely innovative | Cross-project agent memory sharing, AI-driven architecture decisions, self-evolving agent configs |
| **Ecosystem Contribution** | Published tools, MCP servers, or frameworks that other developers adopt | npm-published MCP server with 100+ downloads, open-source orchestrator, widely-referenced agent config patterns |
| **Unconventional Integration** | AI tools connected to unexpected domains in ways not previously seen | AI controlling physical devices, AI managing financial instruments, AI-to-AI cross-provider orchestration |

**Important:** The bar is deliberately high. "Custom" alone isn't enough — a wrapper around an existing API doesn't qualify. The innovation must represent a **genuine conceptual contribution** that the taxonomy needs to update to accommodate.

### How Pioneer Is Awarded

1. **Automated Detection:** The probe flags potential innovations (unknown taxonomy items, custom MCP servers, unusual patterns) during the scan.
2. **Confidence Scoring:** Each flag is assigned a confidence level (high/medium/low) based on novelty indicators.
3. **v1 Heuristic:** In v1, Pioneer is awarded if the probe detects ≥1 high-confidence innovation flag OR ≥3 medium-confidence flags. Manual review may refine edge cases.
4. **v2+ Community Validation:** As the user base grows, Pioneer candidates may be surfaced for lightweight community validation — similar to how academic peer review works, but fast and informal.

### Pioneer on the Shareable Card

The Pioneer badge transforms the visual presentation of the shareable card:

- **🏔️ Pioneer icon** displayed prominently alongside the level and archetype
- **Gold/iridescent border** on the card (vs. standard dark-mode border) — immediately visually distinct
- **"Pioneer" label** beneath the archetype name
- **Innovation callout** — the specific innovation that earned the badge is named on the card (e.g., "🏔️ Pioneer: Custom hardware-control MCP server")

This means a card reading **"Level 38 SGRL — The Tinkerer 🏔️ Pioneer"** is MORE impressive in a specific way than **"Level 85 MARD — The Orchestrator"** — the Tinkerer built something novel that the Orchestrator hasn't.

### The Gold Rush Framing

**"A major draw for using the tool will be to see if you're doing something innovative."**

Pioneer is designed to create a gold rush dynamic:
- Every developer who runs the probe is secretly hoping to see that Pioneer badge
- It's a credential enhancer that can't be gamed by accumulating known tools — you have to actually innovate
- Earning Pioneer at a low level is a badge of honor: "I'm only Level 35, but I'm a Pioneer" carries real weight
- The scarcity makes it coveted: we expect <5% of scans to earn Pioneer in the early months
- Sharing a Pioneer card on social media carries prestige precisely because it's rare and meaningful

### Self-Reinforcing Incentive Loop

```
Developer builds something novel
        ↓
Probe detects innovation → Awards Pioneer badge
        ↓
Developer shares Pioneer card → Social prestige
        ↓
Other developers see it → "I want that badge"
        ↓
They build novel things → More innovation
        ↓
Taxonomy updates to absorb innovations → Bar rises
        ↓
New frontier for next Pioneer → Cycle continues
```

This is the flywheel that makes Vibe Coder Score not just an assessment tool but an **engine for ecosystem innovation.**

---

## 4. Innovation Detection

### What Is Innovation in This Context?

Innovation means patterns, tools, configurations, or combinations that fall **outside the known taxonomy**. These are signals that a developer is inventing rather than just adopting. The probe should flag these with excitement, not confusion.

**Innovation detection is the primary input for Pioneer badge eligibility** (see Section 3.5). Every innovation flag feeds into the Pioneer evaluation pipeline. High-confidence innovations are the gateway to the most coveted distinction in the Vibe Coder Score ecosystem.

### Detection Strategy

The probe should maintain a "known taxonomy" registry (the tool registry in the appendix) and flag anything it finds that:

1. **Unknown tool** — A CLI tool, MCP server, or config file the taxonomy doesn't recognize
2. **Novel combination** — Known tools used together in an unusual way
3. **Custom infrastructure** — Self-built tools, servers, or frameworks
4. **Unusual scale** — Usage patterns that exceed expected norms
5. **Cross-domain integration** — AI tools connected to unexpected domains

### Categories of Innovation

#### 4.1 Custom MCP Servers

Building your own MCP server is the single strongest innovation signal. It means:
- You understand the protocol deeply enough to implement it
- You identified a capability gap no existing server fills
- You're extending the AI's reach into new domains

**Detection:** Source code with MCP SDK imports, local MCP servers not in any public registry, custom SKILL.md files describing novel capabilities.

**Example innovations:**
- MCP server for a proprietary API (internal tools, domain-specific)
- MCP server for hardware control (IoT, home automation from AI)
- MCP server for financial data/trading
- MCP server bridging two platforms (e.g., Figma → code generation pipeline)

#### 4.2 Novel Agent Architectures

Patterns that go beyond the standard taxonomy of agent roles:

**Examples:**
- **Agent genealogies** — Agents that create agents that create agents (multi-level hierarchy beyond supervisor/worker)
- **Competitive agents** — Multiple agents solving the same problem, with a judge selecting the best solution
- **Agent specialization by codebase area** — Dedicated agents per module/service with deep domain context
- **Agent learning loops** — Agents that update their own configs based on outcome data
- **Cross-project agent sharing** — Agents that carry learnings from one project to another
- **Agent marketplace** — Internal system for agents to request capabilities from each other

#### 4.3 Unconventional Tool Combinations

**Examples:**
- AI agents controlling physical devices via MCP (home automation, IoT)
- AI agents managing other AI agents across different providers (Claude managing GPT workers)
- Browser automation agents that interact with visual design tools
- AI agents that write and publish content (blog posts, documentation) as part of the dev workflow
- AI agents that manage cloud infrastructure (scaling, cost optimization) alongside code
- Integration of non-coding AI (image generation, audio) into the development pipeline

#### 4.4 Novel Memory/Context Patterns

**Examples:**
- Shared memory pools across multiple agents (collaborative knowledge base)
- Memory decay patterns (old memories fade, recent ones are strong)
- Episodic vs. semantic memory separation
- Agent-maintained changelogs that serve as institutional memory
- Cross-project context transfer (learnings from Project A inform work on Project B)
- Memory compression (summarizing old logs into distilled insights)

#### 4.5 Unusual Scale Patterns

**Examples:**
- 50+ concurrent agents (industrial scale)
- AI agents working 24/7 with human review in bursts
- Multi-timezone agent scheduling (agents work while developer sleeps)
- Cost optimization at scale (model routing for cost, not just quality)
- Agent workload balancing across multiple accounts/subscriptions

#### 4.6 Process Innovation

**Examples:**
- AI-native project management (agents create, prioritize, and execute tasks)
- AI-driven architecture decisions (agents propose and evaluate design alternatives)
- Automated documentation that stays in sync with code
- AI-generated PRDs from usage patterns
- Self-evolving agent configs (agents update their own CLAUDE.md based on project evolution)

### Innovation Scoring

Each detected innovation adds to the base score AND feeds into Pioneer badge eligibility (Section 3.5). The probe should:

1. **Flag** each innovation with a confidence level (high/medium/low)
2. **Describe** what makes it novel (compared to what's in the taxonomy)
3. **Score bonus** — Each high-confidence innovation adds 2-5 points to the relevant category
4. **Pioneer evaluation** — ≥1 high-confidence or ≥3 medium-confidence flags triggers Pioneer badge award
5. **Narrative** — Include innovations prominently in the smart mirror output, with Pioneer badge callout if earned

---

## 5. Scoring Rubric

### The 8 Scoring Dimensions

Based on the PRD's capability categories, here's how each taxonomy item maps to scores.

---

### 5.1 Intelligence (🧠) — Weight: 15%

*Models, multi-model strategy, context, reasoning*

| Score Range | What It Looks Like |
|-------------|-------------------|
| 0-25 | Single model, default config, chat-only |
| 26-50 | One provider with API key + CLI, basic model selection |
| 51-75 | 2-3 providers, documented model strategy, task-specific selection |
| 76-100 | 3+ providers including local, automated routing, context window optimization, model fallback chains |

**Taxonomy items that score here:**
- 2.1.1 Primary Model Provider
- 2.1.2 Model Routing & Selection Strategy
- 2.1.3 Context Window Utilization
- 2.4.2 Project Context Architecture (context engineering)

**Probe signals:**
- Count of distinct model provider API keys
- Model references in configs with different contexts
- Shell aliases for different models
- Context architecture complexity (split rules, imports)
- Evidence of Haiku/Flash for routine + Opus/Pro for complex

---

### 5.2 Tooling (🔧) — Weight: 15%

*IDE, MCPs, file access, custom skills*

| Score Range | What It Looks Like |
|-------------|-------------------|
| 0-25 | Basic IDE, no extensions, no MCP servers |
| 26-50 | IDE + AI extension + 1-3 MCP servers |
| 51-75 | IDE + CLI + 4-10 MCP servers across categories + custom configs |
| 76-100 | Full tool ecosystem — IDE + CLI + 10+ MCP servers + custom MCP servers + skills + tool integrations |

**Taxonomy items that score here:**
- 2.2.2 IDE-Integrated Agent
- 2.2.3 CLI Agent
- 2.6.1 MCP Server Inventory
- 2.6.2 Custom MCP Servers & Skills
- 2.6.3 Tool-to-Tool Integration

**Probe signals:**
- Count of AI-related VS Code extensions
- CLI tools installed
- MCP server count and category diversity
- Custom MCP servers or skills
- Integration patterns between tools

---

### 5.3 Continuity (🔄) — Weight: 13%

*Memory, session handoff, project context*

| Score Range | What It Looks Like |
|-------------|-------------------|
| 0-25 | No memory, no context persistence, fresh start each session |
| 26-50 | CLAUDE.md as static context, basic project info |
| 51-75 | Memory files, daily logs, active work tracking, bootstrap protocol |
| 76-100 | Multi-layer memory, curated long-term + daily logs, vector store, periodic memory maintenance, cross-session handoff |

**Taxonomy items that score here:**
- 2.4.1 Session Memory / Conversation Persistence
- 2.4.2 Project Context Architecture
- 2.4.3 Cross-Session Continuity
- 2.3.1 Agent Identity & Personality (identity persistence)

**Probe signals:**
- Memory directory existence and structure
- MEMORY.md or equivalent
- Daily log files (pattern, recency)
- Active work tracking files
- Bootstrap protocol in AGENTS.md
- Vector store artifacts

---

### 5.4 Autonomy (🤖) — Weight: 15%

*Proactive work, sub-agents, always-on infra*

| Score Range | What It Looks Like |
|-------------|-------------------|
| 0-25 | Purely reactive — human initiates every interaction |
| 26-50 | AI agent with auto-approve, some scheduled tasks |
| 51-75 | Subagents, heartbeat system, proactive checks, cron-triggered work |
| 76-100 | Full agent workforce — specialized roles, proactive work loop, agent-as-employee, 24/7 operation |

**Taxonomy items that score here:**
- 2.2.4 Multi-Agent / Parallel Execution
- 2.3.2 Subagent Architecture
- 2.3.3 Gas Town Worker Roles (all 7)
- 2.3.4 Proactive Agent Behavior

**Probe signals:**
- Parallel execution infrastructure (tmux, worktrees)
- Subagent definitions
- Heartbeat/cron configs
- AGENTS.md with proactive work directives
- Daemon/service configs for agents
- Evidence of agent-initiated actions
- Orchestrator installation

---

### 5.5 Ship (🚀) — Weight: 15%

*Deploy pipeline, CI/CD, iteration speed*

| Score Range | What It Looks Like |
|-------------|-------------------|
| 0-25 | Manual deploy, no CI, no tests |
| 26-50 | Push-to-deploy, basic CI, some tests |
| 51-75 | Full CI/CD, test suite, staging environment, automated deploy |
| 76-100 | AI-integrated pipeline — agent-opened PRs, merge queue, automated quality gates, multi-environment, rollback |

**Taxonomy items that score here:**
- 2.5.1 CI/CD Pipeline
- 2.5.2 Testing Strategy
- 2.5.3 Deploy Pipeline Sophistication

**Probe signals:**
- GitHub Actions / CI config files
- Deploy configs (Vercel, Netlify, Fly.io, etc.)
- Test directory existence and coverage configs
- Merge queue configuration
- Preview/staging deploy configs
- Deploy scripts
- Git commit frequency (proxy for iteration speed)

---

### 5.6 Security (🛡️) — Weight: 12%

*Credential management, sandboxing, permissions*

| Score Range | What It Looks Like |
|-------------|-------------------|
| 0-25 | API keys in plaintext, no gitignore for secrets, default permissions |
| 26-50 | .env gitignored, environment variables, basic awareness |
| 51-75 | Secure storage, file permissions, agent permission scoping, approval workflows |
| 76-100 | Full security model — keychain/vault, canary tokens, prompt injection defense, permission governance, audit trails |

**Taxonomy items that score here:**
- 2.7.1 Credential Management
- 2.7.2 Agent Permissions & Sandboxing
- 2.7.3 Prompt Injection Defense

**Probe signals:**
- .gitignore contents (secrets patterns)
- File permissions on sensitive files
- Agent permission configs (allow/deny lists)
- Canary tokens in files
- Prompt injection defense sections in agent configs
- Secret manager usage

---

### 5.7 Ops (📊) — Weight: 10%

*Project management, monitoring, docs, maintenance*

| Score Range | What It Looks Like |
|-------------|-------------------|
| 0-25 | No project management, no documentation beyond README |
| 26-50 | Basic documentation, manual project tracking |
| 51-75 | Kanban/task board, agent-accessible task tracking, good documentation |
| 76-100 | AI-integrated project management, automated documentation, maintenance agents, monitoring/alerting |

**Taxonomy items that score here:**
- 2.3.3 Dogs (Maintenance Workers)
- 2.4.3 Cross-Session Continuity (active work tracking)
- 2.5.1 CI/CD Pipeline (monitoring aspects)
- Documentation quality
- Project management integration

**Probe signals:**
- Task/project management files or configs
- Documentation quality and freshness
- Maintenance scripts or cron jobs
- Monitoring/alerting configs
- Automated documentation generation

---

### 5.8 Social (🌐) — Weight: 5%

*Multi-channel, community, collaboration, identity*

| Score Range | What It Looks Like |
|-------------|-------------------|
| 0-25 | Solo developer, no social/collaboration integration |
| 26-50 | One communication channel, basic collaboration |
| 51-75 | Multi-channel, team-aware configs, community participation |
| 76-100 | Full social integration — multi-channel presence, published tools, community leadership, team AI orchestration |

**Taxonomy items that score here:**
- 2.8.1 Multi-Channel Integration
- 2.8.2 Collaborative AI Patterns
- 2.8.3 Community Engagement & Knowledge Sharing

**Probe signals:**
- Communication platform configs
- Published npm packages
- Open-source contributions
- Team-level agent configs
- Multi-channel bot presence

---

### Scoring Algorithm (Simplified)

```
For each of the 8 categories:
  1. Run detection across all relevant taxonomy items
  2. Sum signals found, weighted by tier (Basic=5, Intermediate=15, Advanced=25, Elite=35)
  3. Cap at 100 per category
  4. Apply innovation bonuses (2-5 points per flagged innovation)

Overall Level = Σ (category_score × category_weight)

4-Letter Type:
  Position 1 (Intelligence): S if Intelligence < 50, M if >= 50
  Position 2 (Autonomy): G if Autonomy < 50, A if >= 50
  Position 3 (Ship Speed): C if Ship < 50, R if >= 50
  Position 4 (Stack Depth): L if (Tooling + Continuity + Ops) / 3 < 50, D if >= 50
```

---

## 6. The Smart Mirror Output Spec

### Design Philosophy

The smart mirror output should feel like **a knowledgeable friend telling you what they see in your setup.** Not a report card. Not a lecture. A warm, specific, insightful conversation.

Gary's reaction to the initial codebase analysis was exactly the tone we're targeting: someone who clearly knows the landscape telling you what's exceptional, what's standard, what's missing, and what you should try next. Specificity is key — generic observations ("you use AI tools") are worthless. Specific observations ("your CLAUDE.md has a sophisticated bootstrap protocol with memory layers, but you're missing prompt injection defense") are valuable.

### Output Structure

The smart mirror output has 5 sections:

#### Section 1: The Identity Card

Visual card (rendered via Satori) containing:
- 4-letter type + archetype name
- Level score (0-100)
- 🏔️ Pioneer badge (if earned) — gold/iridescent border + Pioneer label + innovation callout
- Radar chart across 8 categories
- One-line archetype tagline
- Profile URL

```
╔══════════════════════════════════════════╗
║          VIBE CODER SCORE                ║
║                                          ║
║           THE ARCHITECT                  ║  ← Tier Title (large)
║           Level 67 · MARD                ║  ← Level + Archetype Code
║   "You aren't coding anymore."           ║  ← Tagline (italic)
║                                          ║
║         🧠 72 ╱ 🔧 81 ╱ 🔄 68          ║
║         🤖 74 ╱ 🚀 63 ╱ 🛡️ 55          ║
║         📊 58 ╱ 🌐 45                    ║
║                                          ║
║    [RADAR CHART]                         ║
║                                          ║
║    vibecheck.dev/@BrklynGG               ║
╚══════════════════════════════════════════╝
```

The card hierarchy is: **Tier Title** (largest, most prominent) → **Level Number + Archetype Code** (secondary) → **Tagline** (italic subtitle, personality voice) → **Scores + Radar** → **Profile URL**. Pioneer badge earners get 🏔️ icon and gold/iridescent border treatment on top of this layout.

#### Section 2: The Setup Snapshot

A concise inventory of everything detected, organized by category. This is the "here's what we found" section.

**Example output:**

```markdown
## Your Setup at a Glance

### Models & Providers
- **Anthropic** — Claude 4.5 Opus (primary), Claude 3.5 Haiku (fast tasks)
- **OpenAI** — GPT-5.2-codex (via Codex CLI)
- **xAI** — Grok-4 (social/search)
- **Google** — Gemini 2.5 Flash (summarization)
→ 4 providers, model routing visible in shell aliases

### Agent Stack
- **Claude Code** v1.x — primary CLI agent
- **OpenClaw** — personal AI assistant (heartbeat, sub-agents, MCP skills)
- **Codex CLI** v0.93 — secondary agent (full-auto mode)
→ 3 agent frameworks, multi-agent capable

### Agent Config Quality
- **AGENTS.md** — 180 lines: bootstrap protocol, memory management,
  proactive work loop, security boundaries, heartbeat config ⭐
- **SOUL.md** — Personality, boundaries, behavioral principles
- **CLAUDE.md** — Per-project context

### MCP / Skills Ecosystem
- 12 MCP skills detected across 6 categories:
  filesystem, calendar, email, weather, browser, 1password
→ Above average breadth

### Memory Architecture
- Daily logs: memory/YYYY-MM-DD.md (active)
- Long-term: MEMORY.md (curated)
- Active work: memory/active-work.md
- Heartbeat state: memory/heartbeat-state.json
→ 4-layer memory system — this is elite-level continuity

### Deploy & CI
- Vercel auto-deploy (kanban project)
- Custom deploy scripts
- No CI testing pipeline detected ⚠️

### Security
- API keys in environment variables ✓
- File permissions on secrets (chmod 600) ✓
- Canary tokens in sensitive files ✓
- Prompt injection defense in AGENTS.md ✓
- Secret storage in macOS Keychain ✓
→ Strong security posture
```

#### Section 3: The Analysis (The Heart of the Mirror)

This is the "knowledgeable friend" section. Written in second person, warm but honest, specific to what was detected.

**Example output (based on a Gary-like setup):**

> ### What Stands Out
>
> **Your agent architecture is genuinely sophisticated.** The AGENTS.md → SOUL.md → memory system pattern you've built isn't something we see in most scans. The bootstrap protocol (read SOUL.md → USER.md → recent memory → active work) gives your AI real continuity across sessions. Most developers treat every session as a fresh start. You've built institutional memory.
>
> **The heartbeat system is a standout.** Having your AI wake up proactively, check email, review calendar, and pick up work from a kanban board — that's not just automation, that's an AI employee. You've crossed the line from "tool I invoke" to "teammate who shows up." The heartbeat-state.json tracking what's been checked is exactly the kind of operational detail that separates real systems from demos.
>
> **Your security posture is ahead of most.** Canary tokens in sensitive files, explicit prompt injection defense in your agent config, chmod 600 on secrets, keychain integration — you're taking agent security seriously when most developers haven't even considered it. The "require Gary's explicit confirmation for" list in AGENTS.md is a governance model that enterprise teams haven't figured out yet.
>
> **Four model providers with routing is excellent.** Claude for reasoning, Codex for execution, Grok for social search, Gemini for summarization — you're treating models like a portfolio, not a monogamy.
>
> ### Where You Could Level Up
>
> **CI/CD is your weakest link.** For someone with this level of agent sophistication, the deploy pipeline is surprisingly basic. No automated test suite in CI means your agents' output isn't being automatically validated. Adding a GitHub Actions workflow with tests would immediately catch agent-introduced bugs. This is the lowest-effort, highest-impact improvement available to you.
>
> **No git worktree usage detected.** You have the multi-agent infrastructure (OpenClaw subagents, Codex) but no evidence of parallel execution via worktrees. If you're not already running parallel agents in separate worktrees, you're leaving a significant multiplier on the table. Try: `git worktree add -b feature-x .trees/feature-x main` and run a Claude Code instance per worktree.
>
> **Memory maintenance could be more systematic.** You have the architecture (daily + long-term + active work), but MEMORY.md review cycles aren't visible. Consider: weekly "memory maintenance" where the agent reviews recent daily logs and updates the curated MEMORY.md.
>
> ### What's Novel
>
> 🔬 **SOUL.md as agent identity document** — This pattern goes beyond coding rules into defining who the AI is. We're seeing this in <3% of scans. It signals a philosophical depth about AI collaboration that most developers haven't reached.
>
> 🔬 **Kanban integration for proactive agent work** — Your agent reads a task board and picks up work autonomously. This is an innovation in the "AI as employee" space that we're tracking as an emerging pattern.
>
> 🔬 **Multi-channel AI presence** — Your AI operates across Discord, terminal, and potentially other channels with context-aware behavior per platform. This multi-surface pattern is rare and powerful.

#### Section 4: The Comparison (Context)

Where the developer falls relative to the spectrum. Not peer comparison (that's v2), but comparison to the taxonomy's known landscape.

**Example output:**

> ### Where You Are on the Map
>
> **Level 67 Architect · MARD**
> *"You aren't coding anymore."*
>
> You're in the Architect tier — the top ~10% of AI-native developers by our taxonomy. You're past the multi-agent threshold and approaching Orchestrator territory. Most people never get here.
>
> **Your archetype: MARD**
> - **M** (Multi-model): You use 4 providers strategically — well above the median of 1-2
> - **A** (Autonomous): Your agents work proactively, pick up tasks, and manage their own schedule
> - **R** (Rapid): Multiple deploy configs and shipping evidence suggest high iteration velocity
> - **D** (Deep): 12 MCP skills, 4-layer memory, multi-agent — deep ecosystem investment
>
> **Your strongest dimension:** Autonomy (🤖 74) — your proactive agent setup is exceptional
> **Your weakest dimension:** Social (🌐 45) — mostly solo setup, limited team/community integration
> **Biggest opportunity:** Ship (🚀 63) — CI/CD improvements would push this 15+ points

#### Section 5: The Path Forward

Three specific, actionable recommendations ranked by impact.

**Example output:**

> ### Your Next Three Moves
>
> **1. Add CI with tests** (Impact: +15 points on Ship)
> Create `.github/workflows/ci.yml` with your test framework. Even basic smoke tests will catch agent-introduced regressions. This is a 30-minute investment for a permanent quality gate.
>
> **2. Set up git worktrees for parallel agents** (Impact: +10 points on Autonomy)
> You have the multi-agent capability but aren't parallelizing spatially. Add a helper script:
> ```bash
> #!/bin/bash
> # spin-up.sh — create worktree + start agent
> git worktree add -b "$1" ".trees/$1" main
> cd ".trees/$1" && claude --resume
> ```
>
> **3. Build one custom MCP server** (Impact: +8 points on Tooling, +innovation flag)
> You clearly understand the MCP ecosystem. Building even one small custom server (for your most-used API, internal tool, or domain-specific capability) would push you into the "producer" tier and add an innovation flag to your profile.
>
> *Combined impact of all three: estimated +12 levels (67 → 79), entering Orchestrator tier.*

---

### Tone Guide for Mirror Output

The smart mirror's voice is inspired by the NotebookLM audio overview — warm, specific, slightly irreverent, and deeply knowledgeable. Think: a friend who really understands the landscape telling you what they see. Not a report card. Not a robot. A conversation.

| Principle | Do This | Don't Do This |
|-----------|---------|---------------|
| **Warm** | "Your SOUL.md is genuinely interesting — we usually only see this in the top 3% of setups" | "Soul document detected ✓" |
| **Specific** | "Your 4-layer memory system with daily logs + curated MEMORY.md..." | "You have good memory management" |
| **Honest** | "CI/CD is your weakest link — for someone running this level of agent infra, that's a surprising gap" | "Some room for improvement in deployment" |
| **Irreverent** | "You stopped being the driver and became the manager. Most devs never make this jump." | "CLI agent detected. Level: Operator." |
| **Encouraging** | "You're an Architect now — you aren't coding anymore, and that's the point" | "You scored 67 out of 100" |
| **Actionable** | "Add `.github/workflows/ci.yml` — you'll jump from level 42 to 48 immediately" | "Consider improving your CI pipeline" |
| **Knowledgeable** | "We're seeing this pattern in <3% of scans" | "This is uncommon" |
| **Tier-aware** | "You're a Commander now — managing a parallel workforce" | "You are at Level 58" |
| **Respectful** | "Every tier is a real place on the journey — an Apprentice with Pioneer is more impressive than a vanilla Orchestrator" | Implying lower tiers are bad |

### The "Magic Moment" Test

The output passes the quality bar when the developer reads it and thinks:

1. **"They actually understand my setup"** — Specificity. Not generic praise or generic criticism.
2. **"I didn't know that was unusual"** — The mirror shows them things about their setup they hadn't contextualized before.
3. **"I know exactly what to do next"** — Concrete next steps, not vague advice.
4. **"I want to share this"** — The card is beautiful, the type is memorable, the analysis is flattering-but-honest.

---

## 7. Appendix: Tool Registry

The living registry of known tools, frameworks, and patterns that the probe recognizes. This is the "known zoology" — everything here has been classified. Anything the probe finds that ISN'T here gets flagged as a potential innovation.

### AI Model Providers

| Provider | Key Models | Detection Method |
|----------|-----------|-----------------|
| Anthropic | Claude 4 Opus, 4.5 Opus, 3.5 Sonnet/Haiku | `ANTHROPIC_API_KEY`, `claude` CLI |
| OpenAI | GPT-5.2, GPT-5.2-codex, o3, o3-mini | `OPENAI_API_KEY`, `codex` CLI |
| Google | Gemini 2.5 Pro, 2.5 Flash | `GOOGLE_API_KEY`/`GEMINI_API_KEY`, `gemini` CLI |
| xAI | Grok-4, Grok-3, Grok-code-fast | `XAI_API_KEY` |
| Mistral | Codestral, Large 2 | `MISTRAL_API_KEY` |
| Together AI | Various open-source models | `TOGETHER_API_KEY` |
| Groq | Fast inference models | `GROQ_API_KEY` |
| Fireworks | Various models | `FIREWORKS_API_KEY` |
| AWS Bedrock | Claude, Titan, etc. via AWS | AWS credential configs |
| Azure OpenAI | GPT models via Azure | `AZURE_OPENAI_API_KEY` |
| Local (Ollama) | Llama, Mistral, CodeGemma | `ollama` CLI, `~/.ollama/` |
| Local (LM Studio) | Various | `lms` CLI, LM Studio app |

### AI Coding Tools (IDE)

| Tool | Type | Detection |
|------|------|-----------|
| Cursor | Full IDE | `cursor` CLI, `~/.cursor/`, `.cursorrules` |
| GitHub Copilot | Extension | VS Code extension `github.copilot` |
| Windsurf | Full IDE | `windsurf` CLI, Windsurf configs |
| Cline | Extension | VS Code extension `cline` |
| RooCode | Extension | VS Code extension `roo-code` |
| Continue.dev | Extension | VS Code extension `continue.continue` |
| Augment | Extension | VS Code extension `augment` |
| JetBrains Junie | JetBrains plugin | JetBrains config files |
| Tabnine | Extension | VS Code extension `tabnine` |
| Amazon Q Developer | Extension | VS Code extension, AWS configs |

### AI Coding Tools (CLI)

| Tool | Provider | Detection |
|------|----------|-----------|
| Claude Code | Anthropic | `claude` CLI, `CLAUDE.md`, `.claude/` |
| Codex CLI | OpenAI | `codex` CLI, `~/.codex/` |
| Gemini CLI | Google | `gemini` CLI |
| Amp | Sourcegraph | `amp` CLI |
| Aider | Open source | `aider` CLI, `.aider*` configs |
| Goose | Block | `goose` CLI |
| OpenCode | Open source | `opencode` CLI |
| Amazon Q CLI | AWS | `q` CLI |

### Agent Frameworks & Orchestrators

| Tool | Type | Detection |
|------|------|-----------|
| Gas Town | Orchestrator | `gt` CLI, `~/gt/`, Gas Town configs |
| Claude-flow | Orchestrator | `claude-flow` CLI, task JSON files |
| OpenClaw | Personal AI | `openclaw` CLI, AGENTS.md, SOUL.md, skills/ |
| DevSwarm | Orchestrator | `devswarm` configs |
| AxonFlow | Control plane | AxonFlow configs |
| Every Code | Multi-provider | `every-code` configs |
| Agentrooms | Workspace | `agentrooms` configs |
| n8n | Workflow automation | n8n configs, Docker |
| Temporal | Workflow engine | Temporal configs |

### No-Code / Low-Code Platforms (LinkedIn Credential Partners)

These platforms serve a different audience than our probe targets, but understanding the ecosystem matters for positioning.

| Platform | What It Does | LinkedIn Credential | Our Take |
|----------|-------------|-------------------|----------|
| Lovable | Chat-to-app builder | Bronze → Diamond (message count) | Usage counter, not assessment. No taxonomy |
| Replit | Browser IDE + AI agent | Numerical levels (usage) | Platform-locked, quantity-based |
| Relay.app | AI agent/automation builder | Beginner → Advanced "AI Agent Builder" | Closest to real taxonomy, still platform-specific |
| Descript | AI video/audio editing | TBD | Not coding |
| Zapier | Workflow automation | Coming (has internal 4-tier AI fluency framework) | Most serious framework: senior roles require MCP dev + cross-platform analysis |
| GitHub | Code hosting + Copilot | Coming | Could be meaningful if they assess Copilot usage depth |
| Gamma | AI presentations | Coming | Not coding |

### MCP Servers (Common Categories)

| Category | Common Servers | Signal When Present |
|----------|---------------|-------------------|
| Filesystem | @modelcontextprotocol/filesystem | Extended file access |
| Database | sqlite, postgres, supabase, planetscale | Data layer integration |
| Git/GitHub | github, gitlab MCP | Repo management |
| Browser | puppeteer, playwright, browserbase | Web interaction |
| Search | brave-search, google-search, tavily | Information retrieval |
| Memory/RAG | chroma, qdrant, pinecone, mem0 | Persistent memory |
| Communication | slack, discord, email | Multi-channel |
| Cloud | vercel, aws, cloudflare | Infrastructure |
| Monitoring | sentry, datadog | Observability |
| Design | figma, excalidraw | Visual tools |
| Calendar | google-calendar, apple-calendar | Scheduling |
| Knowledge | notion, obsidian, linear | Knowledge management |
| Security | 1password, vault | Secret management |
| Custom/Unknown | Any unrecognized MCP server | **Innovation flag** |

### Configuration Files (Detection Targets)

| File/Pattern | Tool | Signal |
|-------------|------|--------|
| `CLAUDE.md` | Claude Code | Agent manifest |
| `.cursorrules` | Cursor | IDE agent config |
| `.claude/settings.json` | Claude Code | Tool permissions, MCP config |
| `.claude/agents/` | Claude Code | Custom subagents |
| `.claude/skills/` | Claude Code | Custom skills |
| `.claude/rules/` | Claude Code | Split context rules |
| `.claude/memories/` | Claude Code | Built-in memory |
| `AGENTS.md` | OpenClaw | Agent bootstrap + governance |
| `SOUL.md` | OpenClaw | Agent identity |
| `USER.md` | OpenClaw | User context |
| `MEMORY.md` | OpenClaw | Long-term memory |
| `HEARTBEAT.md` | OpenClaw | Proactive behavior config |
| `TOOLS.md` | OpenClaw | Tool-specific notes |
| `memory/` | OpenClaw | Memory directory |
| `skills/` | OpenClaw | MCP skills |
| `EVOLVE.md` | Various | Evolution/growth tracking |
| `.codex/config.toml` | Codex CLI | Codex configuration |
| `.aider*` | Aider | Aider configuration |
| `mcp.json` | Various | MCP server configs |
| `.github/workflows/` | GitHub | CI/CD pipeline |
| `vercel.json` | Vercel | Deploy config |
| `.env` (gitignored) | Various | Environment secrets |
| `.gitignore` | Git | Security hygiene |
| `.tmux.conf` | tmux | Terminal multiplexer config |
| `package.json` (scripts) | npm | Build/test/deploy scripts |
| `Dockerfile` | Docker | Containerization |

### Shell Environment Signals

| Signal | Detection | Interpretation |
|--------|-----------|---------------|
| AI CLI tool aliases | `.zshrc`/`.bashrc` grep | Customization, frequent usage |
| Model-specific aliases | e.g., `alias think='claude --model opus'` | Model routing awareness |
| API key env vars | `.zshrc` or `.env` for API keys | Provider access |
| tmux auto-start | tmux in shell profile | Multi-pane workflow |
| Worktree helper scripts | Scripts matching worktree patterns | Parallel development |
| Agent launcher scripts | Scripts that spawn agent instances | Automation mindset |

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-01 | 1.0 | Initial taxonomy framework |
| 2026-02-01 | 1.1 | Updated based on LinkedIn credential research: added "What Existing Credentials Get Wrong" section contrasting quantity vs quality measurement; added No-Code ↔ CLI spectrum positioning; added "Using vs Building Agent Systems" distinction (Agent User → Agent Orchestrator); added competitor framework comparison table to Evolution Ladder; added Workflow Integration Depth mechanism (2.8.0); added LinkedIn partner platform registry; strengthened quality-over-quantity as core design principle |
| 2026-02-02 | 1.2 | **Pioneer as cross-cutting badge:** Removed "Level 96-100: The Pioneer" from evolution ladder. Pioneer is now a prestige badge/modifier (Section 3.5) awarded independently of level — earnable at ANY score. Evolution ladder tops out at "The Industrialist" (86-100). Innovation Detection (Section 4) now feeds directly into Pioneer eligibility. Added Pioneer badge visual treatment for shareable cards (gold border, icon, innovation callout). Added self-reinforcing incentive loop and gold rush framing |
| 2026-02-02 | 1.3 | **Tier titles + audio voice:** Formalized 9 official tier titles (Observer → Industrialist) with taglines from the NotebookLM audio overview. Added "Tier Titles & The Card" subsection explaining two-layer display (Tier Title + Archetype Code). Rewrote all evolution ladder entries with audio-inspired warm, conversational tone. Updated Smart Mirror output spec — card layout now shows Tier Title (large) + Level + Archetype Code + Tagline (italic). Updated tone guide to reference audio voice as the canonical UX voice. Section heading changed from "10 Levels" to "9 Tiers" |

---

*This document is the intellectual foundation of Vibe Coder Score. It should be updated as the ecosystem evolves, new tools emerge, and new patterns are observed in the wild. Every scan that produces an "unknown taxonomy" flag is a signal that this document needs an update.*

<!-- EOF: vibe-coder-taxonomy.md -->
