import Image from "next/image";
import Link from "next/link";
import { CommandBlock } from "@/components/CommandBlock";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-left">
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight">
          How does your AI coding rig stack up?
        </h1>

        <Image
          src="/hero.jpg"
          alt="Lobster noir — a stylized illustration for Vibe Coder Score"
          width={1400}
          height={763}
          priority
          className="mb-8 mt-2 w-full rounded-xl border border-white/10"
        />

        {/* What it does */}
        <p className="mb-6 text-lg leading-relaxed text-white/60">
          Vibecheck scans your machine for AI tool configs, MCP server setups,
          git metadata, and workflow patterns — reading config file{" "}
          <em>names</em> and tool presence, never file contents or source code.
          Nothing leaves your machine unless you explicitly run{" "}
          <code className="text-white/70">--submit</code>.
        </p>

        {/* What it does NOT do */}
        <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/50">
            What it does not do
          </h2>
          <ul className="space-y-2 text-[15px] text-white/70">
            <li>
              <span className="mr-2 text-red-400">✕</span>
              Does not read source code or file contents
            </li>
            <li>
              <span className="mr-2 text-red-400">✕</span>
              Does not read secret values or API keys (only checks if key names
              exist)
            </li>
            <li>
              <span className="mr-2 text-red-400">✕</span>
              Does not send anything over the network (unless you explicitly{" "}
              <code className="text-white/50">--submit</code>)
            </li>
            <li>
              <span className="mr-2 text-red-400">✕</span>
              Does not install anything persistently (npx runs and exits)
            </li>
            <li>
              <span className="mr-2 text-red-400">✕</span>
              Does not modify any files
            </li>
          </ul>
        </div>

        {/* Command block */}
        <p className="mb-2 text-base font-medium text-white/70">
          Run this in your terminal
        </p>
        <CommandBlock command="npx vibecheck-score" />

        {/* What you get — grid */}
        <div className="mt-8 mb-6">
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
          className="mt-4 mb-6 inline-block text-base font-medium text-indigo-400 underline underline-offset-4 hover:text-indigo-300"
        >
          See a sample result →
        </a>

        {/* Privacy & Security section */}
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-3 text-base font-semibold text-white/80">
            Privacy & Security
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-white/60">
            The probe makes zero network calls during scanning. Shell configs
            and <code className="text-white/50">.env</code> files are checked
            via grep — key <em>names</em> are matched without loading values
            into memory. When you opt into{" "}
            <code className="text-white/50">--submit</code>, a sanitization
            layer strips file paths, platform info, and identifying details
            before anything leaves your machine.
          </p>
          <ul className="mb-3 space-y-1 text-sm text-white/60">
            <li>
              <span className="mr-1.5 text-white/30">—</span>No IP logging, no
              analytics, no cookies
            </li>
            <li>
              <span className="mr-1.5 text-white/30">—</span>You see the full
              payload before confirming submission
            </li>
            <li>
              <span className="mr-1.5 text-white/30">—</span>100% open source —
              every scanner is a single TypeScript file
            </li>
          </ul>
          <Link
            href="/security"
            className="text-sm font-medium text-indigo-400 underline underline-offset-4 hover:text-indigo-300"
          >
            Full security details →
          </Link>
        </div>

      </div>
    </main>
  );
}
