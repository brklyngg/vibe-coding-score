# Launch Copy — Feb 28, 2026
*Vibe Coder Score — Public Launch*
*Drafted by Jerome at 12:30 AM. Ready to copy-paste.*

---

## 🟠 Hacker News — Show HN

**Title:**
```
Show HN: I built a CLI that scores your AI coding setup (0–100 across 8 dimensions)
```

**Body:**
```
npx vibecheck-score

That's the whole install. Runs in about 3 seconds, no network calls, scans ~200 signals across 8 categories: models/providers, MCP servers, memory systems, autonomy infrastructure, CI/CD, security posture, ops tooling, and community presence.

Output: a 0–100 score, a tier title (Observer → Industrialist), a 4-letter type code (like MARC or VGCD), plus specific callouts of what you've built and what you're missing.

Why I built this: I kept having conversations about AI coding setups where people couldn't articulate what they were actually running. "Do you use agents?" "Sort of." "Do you have memory?" "I think so." This gives you a precise vocabulary for your own setup — and a number you can improve.

Privacy-first by design. No network calls during scanning. File contents never read into memory — config files are grep-piped for key names only. Submission is opt-in; a sanitization layer strips paths, agent names, and identifiers before any data leaves your machine.

Compare mode: you can create a session code, share it with someone, and get a side-by-side breakdown of where your setups diverge. Good for teams or just showing off.

Web app at vibecheck.crunchy.tools. Submit your scan to get a shareable result card (opt-in).

Source: https://github.com/garygurevich/vibecheck
npm: https://www.npmjs.com/package/vibecheck-score
```

---

## 🐦 Twitter/X — Launch Thread

**Tweet 1 (main):**
```
Your AI coding setup is invisible until you measure it.

I built a tool that scans your machine in 3 seconds and gives you a score.

npx vibecheck-score

Here's what I found when I ran it on mine 👇
```

**Tweet 2 (show the output):**
```
Level 47 · Operator

Intelligence   45
Tooling       100
Autonomy      100
Ship           15
Security       45
Social          0

"Deep tool ecosystem. You're a producer, not just a consumer. Social is your biggest growth area."

That 0 on Social stung. But it's accurate.
```

**Tweet 3 (explain what it does):**
```
It scans ~200 signals across 8 dimensions:

• Intelligence (which models/APIs you have)
• Tooling (MCP servers, Claude Code, IDEs)
• Continuity (memory systems, CLAUDE.md)
• Autonomy (subagents, orchestration)
• Ship (CI/CD, test frameworks)
• Security (env vars, gitignore, permissions)
• Ops (task tracking, build scripts)
• Social (public repos, npm packages)

You also get a 4-letter type code describing your style.
```

**Tweet 4 (compare mode + privacy):**
```
Privacy-first. No network calls during scanning. Config files are grep-piped — your secrets never load into memory.

Submission is opt-in. If you submit, a sanitization layer strips paths and names before anything leaves your machine.

Compare mode: share a code, run side-by-side with a friend. See exactly where you diverge.
```

**Tweet 5 (CTA):**
```
Run it in any directory for a project-level score, or your home dir for a global vibe.

npx vibecheck-score --submit --handle your-handle

Shareable result card at vibecheck.crunchy.tools/result/your-handle

What's your tier?
```

---

## 💼 LinkedIn Post

**Full post (Gary's voice):**
```
I built a tool that scores your AI coding setup, and I'm shipping it today.

Run: npx vibecheck-score

It scans your machine in about 3 seconds — no installs, no config — and rates your setup across 8 dimensions of what it actually means to build with AI in 2025.

Here's what it checks:
→ Which models and providers you have access to
→ MCP servers, Claude Code, Cursor, IDE integrations
→ Memory systems (CLAUDE.md, rules files, context)
→ Autonomy infrastructure (subagents, hooks, orchestration)
→ CI/CD pipelines and deployment setup
→ Security posture (secrets handling, permissions, .gitignore)
→ Ops tooling (task tracking, build scripts)
→ Community presence (public repos, npm packages)

You get a score from 0–100, a tier title (Observer through Industrialist), and a 4-letter type code that describes your style. It also tells you exactly what you've built and what gaps exist.

Why does this matter for finance and consulting?

Because AI is already reshaping how analytical work gets done. The people who thrive aren't just "using ChatGPT" — they've built infrastructure. They have memory systems, automated pipelines, agent orchestration. The gap between a Level 20 Apprentice and a Level 65 Architect isn't knowledge. It's operational depth.

This tool makes that depth visible and measurable.

Privacy-first by design. Nothing leaves your machine unless you explicitly opt in to submit. File contents are never read — just scanned for key names via grep.

Try it: npx vibecheck-score

Web app + shareable results: vibecheck.crunchy.tools
Source: github.com/garygurevich/vibecheck

What's your tier? Drop your score in the comments. I'm curious what the range looks like across different builder types.
```

---

## 🐱 Product Hunt

**Tagline (60 chars max):**
```
Scan your AI coding setup. Get a score. Level up.
```

**Description (260 chars max, for PH "What is it?" field):**
```
One command scans your AI stack — models, MCP servers, memory systems, agents, CI/CD, security — across 200+ signals. Get a 0-100 score and tier rank (Observer → Industrialist). Privacy-first: no network calls during scanning.
```

**Full PH body post (what you write in the maker comment):**
```
Hey PH 👋

I'm Gary, building at the intersection of finance and AI tooling.

I shipped Vibe Coder Score because I kept having the same frustrating conversation: developers who've built genuinely sophisticated AI setups that they can't describe coherently. They're running 3 model providers, custom agents, MCP servers, memory files — but when asked "how do you use AI?", they say "I use ChatGPT."

This tool gives you a precise vocabulary for your own setup.

Run: npx vibecheck-score

It scans ~200 signals across 8 dimensions in 3 seconds. Output:
• Score (0–100) + tier title
• 4-letter type code (like MARC or VGCD) describing your style
• KEY MECHANISMS: what you've actually built
• GROWTH AREAS: where you're weakest

Privacy by design:
• No network calls during scanning
• File contents are grep-piped, never loaded into memory
• Submit is opt-in; sanitization layer strips all PII before network call
• Source is fully open

Compare mode: create a session code and do a side-by-side with a teammate or friend. See exactly where your setups diverge.

Would love to see your scores in the comments. What's your tier?
```

---

## 📋 Launch Day Checklist

- [ ] Post to HN (Show HN) — aim for 9 AM ET (peak traffic window)
- [ ] Post LinkedIn article (can go up earlier, 7–8 AM)
- [ ] Post Twitter thread (link HN post once it's up)
- [ ] Submit to Product Hunt (midnight PT for full-day exposure)
- [ ] Monitor HN for first-hour comments — respond to every one personally
- [ ] Pin Twitter thread to profile
- [ ] If HN gets traction: share score + "I'm the builder" in replies with data

## ⏰ Recommended Timing

| Platform | Time (ET) | Why |
|----------|-----------|-----|
| Product Hunt | 12:01 AM PT (3:01 AM ET) | Full 24h window |
| LinkedIn | 7–8 AM ET | Pre-commute scroll peak |
| HN Show | 9 AM ET | Morning traffic, US peak |
| Twitter thread | 10 AM ET | Link HN after it's indexed |

---

*Note: No Gary input needed for timing — all copy is ready to paste. Minor edits: swap your PH username, add any GitHub stars count if it's grown.*
