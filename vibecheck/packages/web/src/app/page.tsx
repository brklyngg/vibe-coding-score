import { CommandBlock } from "@/components/CommandBlock";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-left">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-400">
          Vibe Coder Score
        </p>
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight">
          Where does your AI workflow land?
        </h1>
        <p className="mb-6 text-lg text-white/60">
          Scans your tool configs, AI settings, and workflow patterns.
        </p>

        <a
          href="/result/demo"
          className="mb-10 inline-block text-base font-medium text-indigo-400 underline underline-offset-4 hover:text-indigo-300"
        >
          See a sample result →
        </a>

        {/* Single command */}
        <p className="mb-2 text-base font-medium text-white/70">
          Run this in your terminal
        </p>
        <CommandBlock command="npx vibecheck-score" />

        {/* What you get — 2x2 grid */}
        <div className="mt-10 mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">
            What you get
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-left">
              <p className="mb-1 text-base font-semibold text-white/80">Tier & Level</p>
              <p className="text-sm text-white/60">
                A 0-100 score across 9 tiers from Observer to Industrialist.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-left">
              <p className="mb-1 text-base font-semibold text-white/80">Archetype</p>
              <p className="text-sm text-white/60">
                A 4-letter code that captures how you build — strategy, autonomy, shipping, depth.
              </p>
            </div>
            <a
              href="https://docs.google.com/spreadsheets/d/11akbpKFVzdVMtr_tw_1A7VJsZpmVL7Q2yW0gBh66gT4/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 p-4 text-left transition hover:border-indigo-400/30"
            >
              <p className="mb-1 text-base font-semibold text-white/80">
                Taxonomy →
              </p>
              <p className="text-sm text-white/60">
                Every signal the probe found, grouped by category with tier badges.
              </p>
            </a>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-left">
              <p className="mb-1 text-base font-semibold text-white/80">Growth Map</p>
              <p className="text-sm text-white/60">
                Your weakest categories with specific feedback on what to add next.
              </p>
            </div>
          </div>
        </div>

        {/* Safety & Transparency */}
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

        <p className="mt-8 text-xs text-white/25">
          <a
            href="https://github.com/garygurevich/vibecheck"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/40"
          >
            Open source on GitHub
          </a>
        </p>
      </div>
    </main>
  );
}
