export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-400">
          Vibe Coder Score
        </p>
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight">
          How good is your AI coding setup?
        </h1>
        <p className="mb-8 text-lg text-white/60">
          A 15-second scan of your tools, configs, and workflow.
          You see everything before anything is shared.
        </p>
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-4 font-mono text-sm">
          <span className="text-white/40">$</span>{" "}
          <span className="text-indigo-300">npx vibecheck-score</span>
        </div>
        <p className="mb-10 text-sm text-white/40">
          Scans locally. Shows you the results. You decide what to share.
        </p>

        <div className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">
            What you get
          </h2>
          <ul className="space-y-2 text-left text-sm text-white/60 mx-auto max-w-md">
            <li>Your tier and level (0–100)</li>
            <li>A 4-letter archetype that captures how you build</li>
            <li>A shareable card with your radar chart</li>
            <li>Honest feedback on what's strong and what's missing</li>
          </ul>
        </div>

        <a
          href="/result/demo"
          className="mb-8 inline-block text-sm text-indigo-400 underline underline-offset-4 hover:text-indigo-300"
        >
          View a sample result →
        </a>

        <p className="mt-8 text-xs text-white/25">
          Open source. Runs on your machine. Never reads source code, credentials, or secrets.
        </p>
      </div>
    </main>
  );
}
