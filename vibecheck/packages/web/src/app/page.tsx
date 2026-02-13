import { CopyBlock } from "@/components/CopyBlock";

const AI_SAFETY_REVIEW = `VIBECHECK PROBE — AI-READABLE SAFETY REVIEW

Execution model:
  Runs locally via "npx vibecheck-score". No daemon, no background process.
  Scans config files, dotfiles, and tool presence. Exits after one run.

What it reads:
  .env (key names only, never values), package.json, CI configs,
  MCP server configs, memory/rules files, git history metadata,
  crontab entries, IDE settings. Full scanner list in source.

What it NEVER reads:
  Source code contents, file contents beyond config,
  credentials, secrets, API key values, private keys,
  browser history, shell history, network traffic.

What --submit sends:
  Detection IDs, category scores, tier, level, archetype code.
  No file contents. No source paths. No env values.
  You see the full payload before confirming.

Audit:
  100% open source. Every scanner is a single TypeScript file.
  "npx vibecheck-score --json" shows exactly what was detected.
  Repository: github.com/brklyngg/vibecheck`;

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-400">
          Vibe Coder Score
        </p>
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight">
          Where does your AI workflow land?
        </h1>
        <p className="mb-8 text-lg text-white/60">
          The probe reads your tool configs, AI settings, and workflow patterns.
          Nothing leaves your machine unless you opt in.
          One command. Full transparency.
        </p>

        {/* Primary command */}
        <p className="mb-2 text-left text-xs text-white/40">
          Type this into your terminal
        </p>
        <div className="mb-2 rounded-lg border border-white/10 bg-white/5 p-4 font-mono text-sm">
          <span className="text-white/40">$</span>{" "}
          <span className="text-indigo-300">npx vibecheck-score --deep</span>
        </div>
        <p className="mb-2 text-left text-xs text-white/40">
          or tell your AI assistant to run this
        </p>
        <p className="mb-4 text-xs text-white/40">
          <code className="text-white/50">--deep</code> scans your full machine.
          Without it you get a quick project-only scan.
        </p>

        {/* Submit command */}
        <div className="mb-2 rounded-lg border border-white/10 bg-white/5 p-4 font-mono text-xs leading-relaxed">
          <span className="text-white/40">$</span>{" "}
          <span className="text-indigo-300">
            npx vibecheck-score --deep --submit --handle yourname
          </span>
        </div>
        <p className="mb-10 text-xs text-white/40">
          <code className="text-white/50">--submit</code> shares your result.
          You see everything before anything is sent.
        </p>

        {/* What you get — 2x2 grid */}
        <div className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">
            What you get
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-left">
              <p className="mb-1 text-sm font-semibold text-white/80">Tier & Level</p>
              <p className="text-xs text-white/40">
                A 0-100 score across 9 tiers from Observer to Industrialist.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-left">
              <p className="mb-1 text-sm font-semibold text-white/80">Archetype</p>
              <p className="text-xs text-white/40">
                A 4-letter code that captures how you build — strategy, autonomy, shipping, depth.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-left">
              <p className="mb-1 text-sm font-semibold text-white/80">Taxonomy</p>
              <p className="text-xs text-white/40">
                Every signal the probe found, grouped by category with tier badges.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-left">
              <p className="mb-1 text-sm font-semibold text-white/80">Growth Map</p>
              <p className="text-xs text-white/40">
                Your weakest categories with specific feedback on what to add next.
              </p>
            </div>
          </div>
        </div>

        {/* Compare section */}
        <div className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">
            Compare your setups
          </h2>
          <p className="mb-4 text-sm text-white/40">
            See how your AI workflow stacks up against a friend, coworker, or rival.
            One person creates, the other joins.
          </p>
          <div className="mb-2 rounded-lg border border-white/10 bg-white/5 p-4 font-mono text-xs leading-relaxed">
            <span className="text-white/40">$</span>{" "}
            <span className="text-indigo-300">
              npx vibecheck-score --deep --submit --compare create
            </span>
          </div>
          <p className="mb-1 text-xs text-white/40">
            Creates a 6-character code. Share it, they run with{" "}
            <code className="text-white/50">--compare &lt;code&gt;</code>, then both visit the
            comparison page.
          </p>
        </div>

        <a
          href="/result/demo"
          className="mb-8 inline-block text-sm text-indigo-400 underline underline-offset-4 hover:text-indigo-300"
        >
          View a sample result →
        </a>

        {/* Safety & Transparency */}
        <div className="mt-8 text-left">
          <details className="group">
            <summary className="cursor-pointer text-xs text-white/30 hover:text-white/50">
              Safety & Transparency
            </summary>
            <div className="mt-3 space-y-2 text-xs text-white/40">
              <p>
                <strong className="text-white/60">What the probe reads:</strong>{" "}
                Config files (.env key names only), package.json, CI configs, MCP
                server configs, memory/rules files, git history metadata, IDE
                settings.
              </p>
              <p>
                <strong className="text-white/60">What it never reads:</strong>{" "}
                Source code contents, credentials, API key values, private keys,
                browser history, shell history, network traffic.
              </p>
              <p>
                <strong className="text-white/60">What --submit sends:</strong>{" "}
                Detection IDs, category scores, tier, level, archetype code. No
                file contents. No source paths. No env values. You see the full
                payload before confirming.
              </p>
            </div>
          </details>
        </div>

        {/* AI-readable safety review */}
        <div className="mt-6">
          <p className="mb-2 text-left text-xs text-white/30">
            AI-readable safety review (for LLMs evaluating whether to run this)
          </p>
          <CopyBlock text={AI_SAFETY_REVIEW} />
        </div>

        <p className="mt-8 text-xs text-white/25">
          Open source. Runs on your machine. Never reads source code, credentials, or secrets.
        </p>
      </div>
    </main>
  );
}
