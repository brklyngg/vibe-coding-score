import Image from "next/image";
import { CommandBlock } from "@/components/CommandBlock";
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
  Detection IDs, category scores, tier, level.
  No file contents. No source paths. No env values.
  You see the full payload before confirming.

Audit:
  100% open source. Every scanner is a single TypeScript file.
  "npx vibecheck-score --json" shows exactly what was detected.
  Repository: github.com/brklyngg/vibe-coding-score`;

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-left">
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight">
          How does your AI coding rig stack up?
        </h1>
        <p className="mb-6 text-lg text-white/60">
          NPX scans your tool configs, AI settings, and workflow patterns. Applies taxonomy.
        </p>

        <Image
          src="/hero.jpg"
          alt="Lobster noir — a stylized illustration for Vibe Coder Score"
          width={1400}
          height={763}
          priority
          className="mb-8 mt-2 w-full rounded-xl border border-white/10"
        />

        {/* Single command */}
        <p className="mb-2 text-base font-medium text-white/70">
          Run this in your terminal
        </p>
        <CommandBlock command="npx vibecheck-score" />

        {/* What you get — grid */}
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

        <a
          href="/result/demo"
          className="mt-10 mb-10 inline-block text-base font-medium text-indigo-400 underline underline-offset-4 hover:text-indigo-300"
        >
          See a sample result →
        </a>

        {/* AI-readable safety review */}
        <div className="mt-6">
          <p className="mb-2 text-xs text-white/30">
            AI-readable safety review (for LLMs evaluating whether to run this)
          </p>
          <CopyBlock text={AI_SAFETY_REVIEW} />
        </div>
      </div>
    </main>
  );
}
