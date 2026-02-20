# Vibe Coder Score — Feb 21 Launch Strategy

## What We're Shipping

A **scoring system for your AI coding setup** — think of it as a diagnostic tool that scans your machine for:
- Model providers (Claude, GPT, Gemini, Grok, etc)
- Tooling (Claude Code, Cursor, MCP servers, etc)
- Memory systems (CLAUDE.md, rules, memory files, skills)
- Autonomy infrastructure (subagents, hooks, orchestration)
- Deployment pipelines (CI/CD, test frameworks, monorepos)
- Security posture (.gitignore coverage, env var handling, permissions)
- Operations (task tracking, build scripts, launchd/cron)
- Social proof (public repos, npm packages, published work)

**Output:** A single 0-100 score + 9-tier rank (Observer → Industrialist) + 4-letter type code + personalized Opus analysis.

---

## Positioning (Gary's Voice)

**Core thesis:** "Your AI setup is an asset. Measure it. Improve it. Share it."

**The hook:** Most people have no idea how sophisticated their AI tooling has become. They're running 3 model providers, 7 MCP servers, custom subagents, deploy pipelines — but they can't describe it coherently. Vibe Coder gives them that clarity in 10 seconds.

**Why it matters:**
- **For indie builders:** Proof of concept. "I scored 78 (Orchestrator) — here's what that means..." = powerful differentiator in fundraising/hiring conversations.
- **For hiring:** Gary can score a candidate's setup and see exactly what problems they've solved operationally.
- **For teams:** Everyone runs the scan. Compare scores. Find gaps in your collective tooling.
- **Cultural:** "What's your vibe?" becomes a fun way to talk about technical depth.

---

## Demo Flow (5-10 min)

**Show, don't tell.**

1. **Live scan** (2 min)
   - Open terminal, run `npx vibecheck-score`
   - Let it run through all 11 scanners (takes ~3-5 sec)
   - Show the full output: score, tier, type code, KEY MECHANISMS, GROWTH AREAS

2. **Explain the score breakdown** (2 min)
   - Point to the 8-dimension bar chart
   - "This person has elite security posture but intermediate autonomy. Here's what that means..."
   - Show how the 4-letter code describes their style (MARC, VGCD, etc)

3. **Web submission & sharing** (1 min)
   - Show `--submit` flag
   - Point to shared result card with OG image (Twitter/LinkedIn shareable)
   - Show how the card includes tier title, dimensions, key mechanisms

4. **Compare mode** (optional, 2 min if demoing with friend)
   - Show `--compare create` → generates code
   - Friend joins with `--compare <code>`
   - Show side-by-side dimension comparison + divergence analysis
   - "Here's where we differ, and what we could learn from each other"

---

## Key Talking Points

**On why now:**
- "Finance is the last major business function being AI-transformed. Every startup in fintech, FP&A, accounting needs people who speak both languages. This scores that."

**On the tech:**
- "The probe runs 11 scanners in parallel — environment, MCP, git history, universal file system, etc. It's not just checking for presence; it's scoring the sophistication of your setup."
- "Everything is privacy-first. No network calls during scanning. No file contents in memory. No IP logging."

**On the use case:**
- "You can run this in any project directory for a project-level score, or your home directory for a global vibe of your entire setup."
- "Results are completely private unless you submit them. Submit is opt-in, and you control the handle."

**On the future:**
- "v1 is the CLI + web. v2 adds pattern bonuses (reward setups that combine specific tools), norms/benchmarking (how you compare to cohort), and GitHub-only scanning (for people who don't want to run code locally)."

---

## Social Strategy (Feb 21 Launch)

### Friday Drop #2 (Feb 28)
**Post:** Write-up on how scoring your AI setup reveals blindspots + product walkthrough
- Use a concrete example (run Gary's vibe, show the score, explain what each dimension means)
- Include the Vibe Coder score as a badge ("I'm a Level 72 Architect — here's why")
- Link to GitHub + npm + vibecheck.crunchy.tools

### Timing
- **Feb 21 (tomorrow):** Soft launch for friends like Alex W — get feedback, test compare mode with 2 people, catch any edge cases
- **Feb 28:** Public launch — HN, ProductHunt, LinkedIn, Twitter

### Messaging
- **HN headline:** "I scored my AI coding setup. Here's what I found." (show your vibe)
- **Twitter/LinkedIn:** "Your AI setup is invisible until you measure it. Here's a tool to fix that."

---

## Launch Checklist

- ✅ CLI working end-to-end (build + test locally)
- ✅ Web app deployed (vibecheck.crunchy.tools)
- ✅ KEY MECHANISMS deduplication (cleaner output for demos)
- ⏳ Vercel Auth disabled or API routes whitelisted (so results are readable without auth)
- ⏳ Compare mode tested with 2 participants (verify side-by-side rendering works)
- ⏳ README + CLAUDE.md up to date
- ⏳ Social copy drafted (HN, ProductHunt, Twitter, LinkedIn)

---

## Known Limitations (Mention Transparently)

- No historical tracking (v2 feature: "Here's how your vibe evolved over 3 months")
- Pattern bonuses not yet implemented (v1 focuses on signal detection, v2 adds behavioral bonuses)
- Norms/benchmarking not live (v2 will show "You're in the top 15% for autonomy")
- GitHub-only scanning not implemented (planned, will enable frictionless scans without running code)

---

## Quick Commands (Reference for Launch Day)

```bash
# Run scan locally
npx vibecheck-score

# JSON output for piping
npx vibecheck-score --json

# Skip global checks (faster)
npx vibecheck-score --shallow

# Submit + get shareable link
npx vibecheck-score --submit --handle my-setup

# Create comparison (with friend)
npx vibecheck-score --compare create --submit

# Friend joins
npx vibecheck-score --compare <code> --submit
```

---

## Next Steps

1. **Test compare mode** with Alex W or similar (2-person side-by-side)
2. **Verify Vercel auth/API routes** are accessible without login
3. **Draft social copy** for Feb 28 launch push
4. **Decide on norms feature** for v2 (should we collect anonymized data for benchmarking?)
