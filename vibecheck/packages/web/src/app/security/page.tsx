import Link from "next/link";

const SCANNERS = [
  { file: "deploy.ts", desc: "CI/CD configs, deploy targets, Netlify/Vercel/Docker" },
  { file: "environment.ts", desc: "API key names in .env (never values), shell aliases, model providers" },
  { file: "git-history.ts", desc: "Commit frequency, co-author patterns, branch metadata" },
  { file: "mcp.ts", desc: "MCP server configs in Claude Desktop, VS Code, Cursor" },
  { file: "memory.ts", desc: "CLAUDE.md, rules files, context/memory system presence" },
  { file: "orchestration.ts", desc: "Subagents, hooks, tmux/worktree workflows, task runners" },
  { file: "repositories.ts", desc: "Monorepo tooling, npm workspaces, package.json scripts" },
  { file: "security.ts", desc: ".gitignore coverage, env handling, agent permission boundaries" },
  { file: "social.ts", desc: "Public repos, npm packages, webhook integrations" },
  { file: "universal-file.ts", desc: "Config-driven multi-artifact scanner (~70 checks across project/global scope)" },
  { file: "workspace.ts", desc: "IDE settings, extensions, editor integrations" },
] as const;

const SAMPLE_OUTPUT = `{
  "version": "0.4.1",
  "timestamp": "2026-02-18T12:00:00.000Z",
  "platform": "darwin",
  "detections": [
    {
      "id": "mcp-github",
      "category": "tooling",
      "name": "MCP: GitHub",
      "confidence": "high",
      "tier": "intermediate"
    },
    {
      "id": "claude-code",
      "category": "tooling",
      "name": "Claude Code CLI",
      "confidence": "high",
      "tier": "advanced"
    },
    {
      "id": "claude-md",
      "category": "continuity",
      "name": "CLAUDE.md",
      "confidence": "high",
      "tier": "intermediate"
    }
  ],
  "score": {
    "total": 42,
    "tier": "Builder",
    "level": 4,
    "categories": { "tooling": 18, "continuity": 8, "..." : "..." }
  }
}`;

const GITHUB_SCANNER_BASE =
  "https://github.com/brklyngg/vibe-coding-score/blob/main/vibecheck/packages/probe/src/scanners";
const GITHUB_BASE =
  "https://github.com/brklyngg/vibe-coding-score/blob/main/vibecheck";

export default function SecurityPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="max-w-2xl text-left">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-white/40 hover:text-white/60"
        >
          ← Back
        </Link>

        <h1 className="mb-2 text-4xl font-extrabold tracking-tight">
          Security & Privacy
        </h1>
        <p className="mb-10 text-lg text-white/50">
          Everything the probe does, and everything it doesn&apos;t.
        </p>

        {/* Scanner inventory */}
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">
            Scanner Inventory
          </h2>
          <p className="mb-4 text-sm text-white/60">
            The probe runs 11 scanners in parallel. Each is a single TypeScript
            file you can read in full:
          </p>
          <ul className="space-y-2">
            {SCANNERS.map(({ file, desc }) => (
              <li key={file} className="text-sm">
                <a
                  href={`${GITHUB_SCANNER_BASE}/${file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-indigo-400 hover:text-indigo-300"
                >
                  {file}
                </a>
                <span className="text-white/50"> — {desc}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Sample output */}
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">
            Sample Output
          </h2>
          <p className="mb-3 text-sm text-white/60">
            Run <code className="text-white/50">npx vibecheck-score --json</code>{" "}
            to see your full output. Here&apos;s a truncated example:
          </p>
          <pre className="overflow-x-auto rounded-lg border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-white/70">
            {SAMPLE_OUTPUT}
          </pre>
        </section>

        {/* Sanitization pipeline */}
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">
            Sanitization Pipeline
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-white/60">
            When you opt into <code className="text-white/50">--submit</code>,
            the{" "}
            <a
              href={`${GITHUB_BASE}/packages/probe/src/flows/sanitize.ts`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300"
            >
              sanitizeForSubmit()
            </a>{" "}
            function runs before any network call. It uses a whitelist approach:
          </p>
          <ul className="space-y-1 text-sm text-white/60">
            <li>
              <span className="mr-1.5 text-white/30">—</span>File paths like{" "}
              <code className="text-white/50">~/.zshrc</code> are normalized to
              generic labels (<code className="text-white/50">shell-config</code>
              )
            </li>
            <li>
              <span className="mr-1.5 text-white/30">—</span>Only numeric counts
              and enum-like strings pass through the detail whitelist
            </li>
            <li>
              <span className="mr-1.5 text-white/30">—</span>Agent names, alias
              names, and identifying details are stripped
            </li>
            <li>
              <span className="mr-1.5 text-white/30">—</span>Platform is set to{" "}
              <code className="text-white/50">&quot;redacted&quot;</code>
            </li>
          </ul>
        </section>

        {/* Merge flow */}
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">
            Multi-Machine Merge Flow
          </h2>
          <p className="mb-3 text-sm text-white/60">
            The merge feature lets you combine scans from two machines (e.g.,
            work laptop + personal desktop) into a single score:
          </p>
          <ol className="space-y-2 text-sm text-white/60">
            <li>
              <span className="mr-1.5 font-semibold text-white/40">1.</span>
              <strong className="text-white/70">Machine A</strong> scans locally
              and submits → receives a handle
            </li>
            <li>
              <span className="mr-1.5 font-semibold text-white/40">2.</span>
              You share the handle with{" "}
              <strong className="text-white/70">Machine B</strong>
            </li>
            <li>
              <span className="mr-1.5 font-semibold text-white/40">3.</span>
              Machine B runs{" "}
              <code className="text-white/50">
                npx vibecheck-score --merge-from &lt;handle&gt;
              </code>
            </li>
            <li>
              <span className="mr-1.5 font-semibold text-white/40">4.</span>
              Machine B fetches <em>detection IDs only</em> (not raw data) from
              Machine A&apos;s submission
            </li>
            <li>
              <span className="mr-1.5 font-semibold text-white/40">5.</span>
              Machine B runs its own local scan, combines detections, and
              submits the merged result
            </li>
          </ol>
          <p className="mt-3 text-sm text-white/50">
            At no point does one machine receive the other&apos;s raw scan data,
            file paths, or config contents.
          </p>
        </section>

        {/* What the scan doesn't collect */}
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">
            What The Scan Doesn&apos;t Collect
          </h2>
          <ul className="space-y-2 text-sm text-white/70">
            <li>
              <span className="mr-2 text-red-400">✕</span>
              No source code or file contents
            </li>
            <li>
              <span className="mr-2 text-red-400">✕</span>
              No secret values or API keys
            </li>
            <li>
              <span className="mr-2 text-red-400">✕</span>
              No network calls during scanning
            </li>
            <li>
              <span className="mr-2 text-red-400">✕</span>
              No persistent installation
            </li>
            <li>
              <span className="mr-2 text-red-400">✕</span>
              No file modifications
            </li>
            <li>
              <span className="mr-2 text-red-400">✕</span>
              No IP logging
            </li>
            <li>
              <span className="mr-2 text-red-400">✕</span>
              No analytics or telemetry
            </li>
            <li>
              <span className="mr-2 text-red-400">✕</span>
              No cookies or tracking
            </li>
          </ul>
          <p className="mt-4 text-sm text-white/50">
            The submit API endpoint is open source:{" "}
            <a
              href={`${GITHUB_BASE}/packages/web/src/app/api/submit/route.ts`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300"
            >
              api/submit/route.ts
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
