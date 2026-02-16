import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type {
  TaxonomyCategory,
  ProbeResult,
} from "@vibe/scoring";
import {
  TAXONOMY_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_EMOJI,
} from "@vibe/scoring";
import {
  DIMENSION_COMMENTARY,
} from "@/lib/narrative-templates";
import { RefreshTimer } from "@/components/RefreshTimer";
import { CompareAnalysis } from "@/components/CompareAnalysis";

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

const HEAVY_SEP = "━".repeat(53);
const LIGHT_SEP = "─".repeat(52);

function tierBadgeClass(tier: string): string {
  const map: Record<string, string> = {
    basic: "text-white/40",
    intermediate: "text-cyan-400",
    advanced: "text-purple-400",
    elite: "text-yellow-400",
  };
  return map[tier] ?? "text-white/40";
}

function tierBadgeLabel(tier: string): string {
  const map: Record<string, string> = {
    basic: "[basic]",
    intermediate: "[inter]",
    advanced: "[adv]",
    elite: "[elite]",
  };
  return map[tier] ?? `[${tier}]`;
}

function TermBar({ score, color }: { score: number; color: string }) {
  const filled = Math.round(score / 10);
  const empty = 10 - filled;
  return (
    <span>
      <span className={color}>{"█".repeat(filled)}</span>
      <span className="text-white/20">{"░".repeat(empty)}</span>
    </span>
  );
}

function getDetectionHint(category: TaxonomyCategory): string {
  const hints: Partial<Record<TaxonomyCategory, string>> = {
    intelligence: "Consider adding this model strategy",
    tooling: "This tool integration could boost your setup",
    continuity: "This memory approach helps AI retain context",
    autonomy: "This agent pattern increases automation",
    ship: "This shipping practice accelerates delivery",
    security: "This security measure hardens your workflow",
    ops: "This ops practice improves maintainability",
    social: "This social integration expands your reach",
  };
  return hints[category] ?? "Worth exploring";
}

function getCommentary(category: TaxonomyCategory, score: number): string {
  const band = score >= 60 ? "high" : score >= 30 ? "mid" : "low";
  return DIMENSION_COMMENTARY[category][band];
}

export default async function ComparePage({ params }: PageProps) {
  const { code } = await params;
  const comparison = await getComparison(code);
  if (!comparison) notFound();

  // --- Waiting state (unchanged) ---
  if (!comparison.handle_b) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <RefreshTimer intervalMs={15000} />
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

  // --- Complete state: terminal aesthetic ---
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

  // Unique detections — full lists, no truncation
  const idsA = new Set(resultA.detections.map((d) => d.id));
  const idsB = new Set(resultB.detections.map((d) => d.id));
  const uniqueToA = resultA.detections.filter((d) => !idsB.has(d.id));
  const uniqueToB = resultB.detections.filter((d) => !idsA.has(d.id));

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 font-mono">
      <div className="rounded-lg border border-white/10 bg-[#0d1117] p-6 shadow-lg">
        {/* Title bar dots */}
        <div className="mb-4 flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <span className="h-3 w-3 rounded-full bg-green-500/70" />
        </div>

        {/* Top separator */}
        <p className="text-white/30">{HEAVY_SEP}</p>
        <br />

        {/* Header */}
        <p className="font-bold text-white">VIBE CODER SCORE — COMPARE</p>
        <br />

        {/* Two handles */}
        <p>
          <span className="text-indigo-400">@{comparison.handle_a}</span>
          <span className="text-white/40">: Level {scoreA.level} · {scoreA.tier.title}</span>
        </p>
        <p>
          <span className="text-emerald-400">@{comparison.handle_b}</span>
          <span className="text-white/40">: Level {scoreB.level} · {scoreB.tier.title}</span>
        </p>
        <br />

        {/* Dimensions — dual bar rows */}
        <p className="font-bold text-white">DIMENSIONS</p>
        <p className="text-white/30">{LIGHT_SEP}</p>
        <br />

        {TAXONOMY_CATEGORIES.map((cat) => {
          const sA = catMapA.get(cat) ?? 0;
          const sB = catMapB.get(cat) ?? 0;
          const gap = Math.abs(sA - sB);
          return (
            <div key={cat} className="mb-1">
              {/* Desktop: single row. Mobile: stacked */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="w-28 shrink-0 text-white/60">
                  {CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]}
                </span>
                <span className="flex items-center gap-1">
                  <TermBar score={sA} color="text-indigo-400" />
                  <span className="w-8 text-right text-indigo-400">{sA}</span>
                </span>
                <span className="flex items-center gap-1">
                  <TermBar score={sB} color="text-emerald-400" />
                  <span className="w-8 text-right text-emerald-400">{sB}</span>
                </span>
                {gap >= 15 && (
                  <span className="text-amber-400 text-xs">[{gap}pt]</span>
                )}
              </div>
            </div>
          );
        })}
        <br />

        {/* Where you diverge */}
        {divergences.length > 0 && divergences[0].gap > 0 && (
          <>
            <p className="font-bold text-white">WHERE YOU DIVERGE</p>
            <p className="text-white/30">{LIGHT_SEP}</p>
            <br />
            {divergences.map(({ category, scoreA: sA, scoreB: sB, gap }) => {
              if (gap === 0) return null;
              const higherScore = Math.max(sA, sB);
              return (
                <div key={category} className="mb-3">
                  <p>
                    <span className="text-white/60">
                      {CATEGORY_EMOJI[category]} {CATEGORY_LABELS[category]}
                    </span>
                    <span className="ml-2 text-amber-400">[{gap}pt gap]</span>
                  </p>
                  <p className="text-white/50">
                    {"  "}
                    <span className="text-indigo-400">@{comparison.handle_a}: {sA}</span>
                    {"  "}
                    <span className="text-emerald-400">@{comparison.handle_b}: {sB}</span>
                  </p>
                  <p className="pl-4 text-white/40">
                    {getCommentary(category, higherScore)}
                  </p>
                </div>
              );
            })}
            <br />
          </>
        )}

        {/* Unique detections */}
        {(uniqueToA.length > 0 || uniqueToB.length > 0) && (
          <>
            <p className="font-bold text-white">UNIQUE DETECTIONS</p>
            <p className="text-white/30">{LIGHT_SEP}</p>
            <br />

            {uniqueToA.length > 0 && (
              <>
                <p className="text-indigo-400">Only @{comparison.handle_a}:</p>
                {uniqueToA.map((d) => (
                  <div key={d.id} className="mb-1">
                    <p className="text-white/50">
                      {"  "}{CATEGORY_EMOJI[d.category]} {d.name}{" "}
                      <span className={tierBadgeClass(d.tier)}>{tierBadgeLabel(d.tier)}</span>
                    </p>
                    <p className="pl-6 text-white/30 text-xs">
                      @{comparison.handle_b}: {getDetectionHint(d.category)}
                    </p>
                  </div>
                ))}
                <br />
              </>
            )}

            {uniqueToB.length > 0 && (
              <>
                <p className="text-emerald-400">Only @{comparison.handle_b}:</p>
                {uniqueToB.map((d) => (
                  <div key={d.id} className="mb-1">
                    <p className="text-white/50">
                      {"  "}{CATEGORY_EMOJI[d.category]} {d.name}{" "}
                      <span className={tierBadgeClass(d.tier)}>{tierBadgeLabel(d.tier)}</span>
                    </p>
                    <p className="pl-6 text-white/30 text-xs">
                      @{comparison.handle_a}: {getDetectionHint(d.category)}
                    </p>
                  </div>
                ))}
                <br />
              </>
            )}
          </>
        )}

        {/* Comparative analysis (only visible to authenticated viewer) */}
        <CompareAnalysis handleA={comparison.handle_a} handleB={comparison.handle_b} />

        {/* Bottom separator */}
        <p className="text-white/30">{HEAVY_SEP}</p>
        <br />

        {/* Individual result links */}
        <p className="text-white/40 mb-1">View individual results:</p>
        <p className="mb-1">
          <a href={`/result/${comparison.handle_a}`} className="text-indigo-400 hover:underline">
            @{comparison.handle_a}
          </a>
          {" · "}
          <a href={`/result/${comparison.handle_b}`} className="text-emerald-400 hover:underline">
            @{comparison.handle_b}
          </a>
        </p>
        <br />

        {/* Footer */}
        <p className="text-white/40">
          Want to compare with someone else?
        </p>
        <p className="text-white/30">
          <span className="text-white/20">$</span>{" "}
          <span className="text-indigo-300">
            npx vibecheck-score --submit --compare create
          </span>
        </p>
      </div>
    </main>
  );
}
