import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type {
  ScoreResult,
  Detection,
  TaxonomyCategory,
  ProbeResult,
} from "@/lib/types";
import {
  TAXONOMY_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_EMOJI,
} from "@/lib/types";
import {
  ARCHETYPE_NAMES,
  DIMENSION_COMMENTARY,
} from "@/lib/narrative-templates";
import { RefreshTimer } from "@/components/RefreshTimer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: ReturnType<typeof createClient<any>> | null = null;
function getSupabase() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (_supabase ??= createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ));
}

interface Comparison {
  code: string;
  handle_a: string;
  handle_b: string | null;
}

interface PageProps {
  params: Promise<{ code: string }>;
}

async function getComparison(code: string): Promise<Comparison | null> {
  const { data } = await getSupabase()
    .from("comparisons")
    .select("code, handle_a, handle_b")
    .eq("code", code)
    .single();
  return data;
}

async function getResult(handle: string): Promise<ProbeResult | null> {
  const { data } = await getSupabase()
    .from("results")
    .select("probe_result")
    .eq("handle", handle)
    .single();
  return data?.probe_result ?? null;
}

function getCommentary(category: TaxonomyCategory, score: number): string {
  const band = score >= 60 ? "high" : score >= 30 ? "mid" : "low";
  return DIMENSION_COMMENTARY[category][band];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const comparison = await getComparison(code);
  if (!comparison) return { title: "Not Found" };

  if (!comparison.handle_b) {
    return { title: "Waiting for opponent — Vibe Coder Score" };
  }

  return {
    title: `${comparison.handle_a} vs ${comparison.handle_b} — Vibe Coder Score`,
  };
}

// Force dynamic rendering so auto-refresh picks up changes
export const dynamic = "force-dynamic";

function ScoreBar({
  score,
  color,
}: {
  score: number;
  color: string;
}) {
  return (
    <div className="h-2 flex-1 rounded-full bg-white/10">
      <div
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${Math.min(score, 100)}%` }}
      />
    </div>
  );
}

function tierBadgeClass(tier: string): string {
  const map: Record<string, string> = {
    basic: "text-white/40",
    intermediate: "text-cyan-400",
    advanced: "text-purple-400",
    elite: "text-yellow-400",
  };
  return map[tier] ?? "text-white/40";
}

export default async function ComparePage({ params }: PageProps) {
  const { code } = await params;
  const comparison = await getComparison(code);
  if (!comparison) notFound();

  const hero = (
    <div className="mb-8 text-center">
      <p className="text-4xl tracking-widest">
        <span className="inline-block -scale-x-100">🕵️</span>
        <span className="mx-4 text-white/20">vs</span>
        <span>🕵️</span>
      </p>
      <p className="mt-2 text-xs tracking-widest text-white/30">
        Open your coat. Show your stack.
      </p>
    </div>
  );

  // --- Waiting state ---
  if (!comparison.handle_b) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <RefreshTimer intervalMs={15000} />
        {hero}
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-400">
          Compare Mode
        </p>
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight">
          Waiting for someone to join...
        </h1>

        <div className="mb-8 inline-block rounded-xl border border-white/10 bg-white/5 px-8 py-6">
          <p className="mb-2 text-xs uppercase tracking-widest text-white/40">
            Share this code
          </p>
          <p className="font-mono text-4xl font-bold tracking-[0.3em] text-white">
            {comparison.code}
          </p>
        </div>

        <div className="mb-8 rounded-lg border border-white/10 bg-white/5 p-4 text-left font-mono text-sm">
          <span className="text-white/40">$</span>{" "}
          <span className="text-indigo-300">
            npx vibecheck-score --submit --compare {comparison.code}
          </span>
        </div>

        <p className="text-xs text-white/30">
          This page auto-refreshes every 15 seconds.
        </p>
      </main>
    );
  }

  // --- Complete state ---
  const [resultA, resultB] = await Promise.all([
    getResult(comparison.handle_a),
    getResult(comparison.handle_b),
  ]);

  if (!resultA || !resultB) notFound();

  const scoreA = resultA.score;
  const scoreB = resultB.score;

  const catMapA = new Map<TaxonomyCategory, number>(
    scoreA.categories.map((c) => [c.category, c.score])
  );
  const catMapB = new Map<TaxonomyCategory, number>(
    scoreB.categories.map((c) => [c.category, c.score])
  );

  // Top 3 divergences
  const divergences = TAXONOMY_CATEGORIES.map((cat) => ({
    category: cat,
    scoreA: catMapA.get(cat) ?? 0,
    scoreB: catMapB.get(cat) ?? 0,
    gap: Math.abs((catMapA.get(cat) ?? 0) - (catMapB.get(cat) ?? 0)),
  }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  // Unique detections
  const idsA = new Set(resultA.detections.map((d) => d.id));
  const idsB = new Set(resultB.detections.map((d) => d.id));
  const uniqueToA = resultA.detections
    .filter((d) => !idsB.has(d.id))
    .slice(0, 8);
  const uniqueToB = resultB.detections
    .filter((d) => !idsA.has(d.id))
    .slice(0, 8);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      {hero}
      {/* 1. Identity cards */}
      <section className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-indigo-400/30 bg-indigo-400/5 p-5">
          <p className="mb-1 text-sm font-semibold text-indigo-400">
            @{comparison.handle_a}
          </p>
          <p className="text-3xl font-extrabold">
            Level {scoreA.level}
          </p>
          <p className="text-sm text-white/60">
            {scoreA.tier.title} [{scoreA.typeCode.code}]
          </p>
          <p className="mt-1 text-xs text-white/40">
            {ARCHETYPE_NAMES[scoreA.typeCode.code] ?? "Unknown"}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-5">
          <p className="mb-1 text-sm font-semibold text-emerald-400">
            @{comparison.handle_b}
          </p>
          <p className="text-3xl font-extrabold">
            Level {scoreB.level}
          </p>
          <p className="text-sm text-white/60">
            {scoreB.tier.title} [{scoreB.typeCode.code}]
          </p>
          <p className="mt-1 text-xs text-white/40">
            {ARCHETYPE_NAMES[scoreB.typeCode.code] ?? "Unknown"}
          </p>
        </div>
      </section>

      {/* 2. Dimension comparison */}
      <section className="mb-10 space-y-4">
        <h2 className="text-lg font-bold text-white/80">Dimensions</h2>
        {TAXONOMY_CATEGORIES.map((cat) => {
          const sA = catMapA.get(cat) ?? 0;
          const sB = catMapB.get(cat) ?? 0;
          const gap = Math.abs(sA - sB);
          return (
            <div key={cat}>
              <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                <span>{CATEGORY_EMOJI[cat]}</span>
                <span>{CATEGORY_LABELS[cat]}</span>
                {gap >= 15 && (
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold text-amber-400">
                    {gap}pt gap
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 text-right text-xs text-indigo-400">{sA}</span>
                <ScoreBar score={sA} color="bg-indigo-400" />
              </div>
              <div className="mt-1 flex items-center gap-3">
                <span className="w-6 text-right text-xs text-emerald-400">{sB}</span>
                <ScoreBar score={sB} color="bg-emerald-400" />
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Where you diverge */}
      {divergences.length > 0 && divergences[0].gap > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-bold text-white/80">
            Where you diverge
          </h2>
          <div className="space-y-4">
            {divergences.map(({ category, scoreA: sA, scoreB: sB, gap }) => {
              if (gap === 0) return null;
              const higherScore = Math.max(sA, sB);
              return (
                <div
                  key={category}
                  className="rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span>{CATEGORY_EMOJI[category]}</span>
                    <span className="font-medium">{CATEGORY_LABELS[category]}</span>
                    <span className="ml-auto rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold text-amber-400">
                      {gap}pt gap
                    </span>
                  </div>
                  <div className="mb-2 flex gap-4 text-sm">
                    <span className="text-indigo-400">
                      @{comparison.handle_a}: {sA}
                    </span>
                    <span className="text-emerald-400">
                      @{comparison.handle_b}: {sB}
                    </span>
                  </div>
                  <p className="text-xs text-white/40">
                    {getCommentary(category, higherScore)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. What they have that you don't */}
      {(uniqueToA.length > 0 || uniqueToB.length > 0) && (
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-bold text-white/80">
            What they have that you don&apos;t
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-indigo-400">
                Only @{comparison.handle_a}
              </p>
              {uniqueToA.length === 0 ? (
                <p className="text-xs text-white/30">Nothing unique</p>
              ) : (
                <ul className="space-y-1">
                  {uniqueToA.map((d) => (
                    <li key={d.id} className="text-xs text-white/50">
                      {CATEGORY_EMOJI[d.category]} {d.name}{" "}
                      <span className={tierBadgeClass(d.tier)}>
                        [{d.tier}]
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-emerald-400">
                Only @{comparison.handle_b}
              </p>
              {uniqueToB.length === 0 ? (
                <p className="text-xs text-white/30">Nothing unique</p>
              ) : (
                <ul className="space-y-1">
                  {uniqueToB.map((d) => (
                    <li key={d.id} className="text-xs text-white/50">
                      {CATEGORY_EMOJI[d.category]} {d.name}{" "}
                      <span className={tierBadgeClass(d.tier)}>
                        [{d.tier}]
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. CTA footer */}
      <footer className="border-t border-white/10 pt-6 text-center">
        <p className="mb-3 text-sm text-white/50">
          Want to compare with someone else?
        </p>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 font-mono text-xs">
          <span className="text-white/40">$</span>{" "}
          <span className="text-indigo-300">
            npx vibecheck-score --submit --compare create
          </span>
        </div>
      </footer>
    </main>
  );
}
