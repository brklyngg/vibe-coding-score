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
          Run the probe. Get your tier, archetype, and shareable card.
          Not a participation trophy — a real assessment.
        </p>
        <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4 font-mono text-sm">
          <span className="text-white/40">$</span>{" "}
          <span className="text-indigo-300">npx vibecheck-probe --submit --handle yourname</span>
        </div>
        <p className="mb-4 text-sm text-white/30">
          Observer → Apprentice → Practitioner → Builder → Operator → Commander → Architect → Orchestrator → Industrialist
        </p>
        <a
          href="/result/demo"
          className="text-sm text-indigo-400 underline underline-offset-4 hover:text-indigo-300"
        >
          View a sample result →
        </a>
      </div>
    </main>
  );
}
