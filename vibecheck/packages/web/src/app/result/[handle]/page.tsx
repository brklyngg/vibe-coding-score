import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type {
  Detection,
  TaxonomyCategory,
  ProbeResult,
} from "@vibe/scoring";
import {
  TAXONOMY_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_EMOJI,
} from "@vibe/scoring";
import {
  TIER_TAGLINES,
  PIONEER_HOOKS,
  generateNarrativeWeb,
  getNextTierWeb,
  commentaryForScoreWeb,
} from "@/lib/narrative-templates";
import { CopyUrlButton } from "@/components/CopyUrlButton";
import { MOCK_RESULT } from "@/lib/mock-data";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: ReturnType<typeof createClient<any>> | null = null;
function getSupabase() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (_supabase ??= createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ));
}

interface PageProps {
  params: Promise<{ handle: string }>;
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
  const { handle } = await params;
  const result = await getResult(handle) ?? (handle === "demo" ? MOCK_RESULT : null);
  if (!result) return { title: "Not Found" };

  const { score } = result;
  const title = `${handle} is a Level ${score.level} ${score.tier.title}`;
  const description = TIER_TAGLINES[score.tier.title];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og/${handle}`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og/${handle}`],
    },
  };
}

const HEAVY_SEP = "━".repeat(53);
const LIGHT_SEP = "─".repeat(52);

function scoreColorClass(score: number): string {
  if (score >= 50) return "text-green-400";
  if (score >= 25) return "text-yellow-400";
  return "text-red-400";
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

function tierBadgeLabel(tier: string): string {
  const map: Record<string, string> = {
    basic: "[basic]",
    intermediate: "[inter]",
    advanced: "[adv]",
    elite: "[elite]",
  };
  return map[tier] ?? `[${tier}]`;
}

function TermBar({ score }: { score: number }) {
  const filled = Math.round(score / 10);
  const empty = 10 - filled;
  return (
    <span>
      <span className={scoreColorClass(score)}>{"█".repeat(filled)}</span>
      <span className="text-white/20">{"░".repeat(empty)}</span>
    </span>
  );
}

export default async function ResultPage({ params }: PageProps) {
  const { handle } = await params;
  const result = await getResult(handle) ?? (handle === "demo" ? MOCK_RESULT : null);
  if (!result) notFound();

  const { score, detections } = result;

  // Group detections by category in taxonomy order
  const grouped = new Map<TaxonomyCategory, Detection[]>();
  for (const d of detections) {
    const list = grouped.get(d.category) ?? [];
    list.push(d);
    grouped.set(d.category, list);
  }

  // Named mechanisms
  const named = detections.filter(
    (d) => d.details?.names && Array.isArray(d.details.names) && (d.details.names as string[]).length > 0
  );

  // Pattern bonuses (deduplicated)
  const seenPatterns = new Set<string>();
  const patterns = detections.filter((d) => {
    if (!d.id.startsWith("pattern:")) return false;
    const base = d.id.includes(":") ? d.id.split(":").slice(0, 2).join(":") : d.id;
    if (seenPatterns.has(base)) return false;
    seenPatterns.add(base);
    return true;
  });

  // Weakest categories for growth areas
  const weakest = [...score.categories]
    .filter((c) => c.score < 50)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const nextTier = getNextTierWeb(score.tier.title);
  const narrative = generateNarrativeWeb(score, detections);

  // Category and signal counts for footer
  let categoryCount = 0;
  let hasInnovations = false;
  for (const cat of TAXONOMY_CATEGORIES) {
    const items = grouped.get(cat);
    if (items && items.length > 0) categoryCount++;
  }
  for (const d of detections) {
    if (d.taxonomyMatch === null) hasInnovations = true;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 font-mono">
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
        <p className="font-bold text-white">VIBE CODER SCORE</p>
        <br />

        {/* Level + Tier */}
        <p className="font-bold text-white">
          Level {score.level} · {score.tier.title}
        </p>
        <p className="text-white/40">
          &quot;{score.tier.tagline}&quot;
        </p>
        <br />

        {/* Narrative */}
        <p className="text-white/80">{narrative}</p>
        <br />

        {/* Category bar chart */}
        {TAXONOMY_CATEGORIES.map((cat) => {
          const catScore = score.categories.find((c) => c.category === cat);
          const s = catScore?.score ?? 0;
          return (
            <p key={cat} className="leading-relaxed">
              <span className="text-white/60">{CATEGORY_LABELS[cat].padEnd(12)}</span>
              {"  "}
              <TermBar score={s} />
              {"  "}
              <span className="font-bold text-white">{String(s).padStart(3)}</span>
            </p>
          );
        })}
        <br />

        {/* WHAT WE FOUND */}
        <p className="font-bold text-white">WHAT WE FOUND</p>
        <p className="text-white/30">{LIGHT_SEP}</p>
        <br />

        {/* Taxonomy table */}
        {TAXONOMY_CATEGORIES.map((cat) => {
          const items = grouped.get(cat);
          if (!items || items.length === 0) return null;
          return items.map((d, i) => {
            const catLabel = i === 0 ? CATEGORY_LABELS[cat] : "";
            const truncName = d.name.length > 40 ? d.name.slice(0, 39) + "…" : d.name;
            const innovation = d.taxonomyMatch === null;
            return (
              <p key={d.id + i} className="leading-relaxed">
                <span className="text-white/50">{catLabel.padEnd(14)}</span>
                {" "}
                <span className="text-white/70">{truncName.padEnd(40)}</span>
                {" "}
                <span className={tierBadgeClass(d.tier)}>{tierBadgeLabel(d.tier)}</span>
                {innovation && <span className="text-yellow-400"> *</span>}
              </p>
            );
          });
        })}
        <br />
        <p className="text-white/30">
          {detections.length} signals · {categoryCount} categories
        </p>
        {hasInnovations && (
          <p className="text-white/30">* = novel detection (not in standard registry)</p>
        )}
        <br />

        {/* KEY MECHANISMS */}
        {(named.length > 0 || patterns.length > 0) && (
          <>
            <p className="font-bold text-white">KEY MECHANISMS</p>
            <p className="text-white/30">{LIGHT_SEP}</p>
            <br />
            {named.map((d) => {
              const names = d.details!.names as string[];
              const maxShow = 6;
              const shown = names.slice(0, maxShow).join(", ");
              const more = names.length > maxShow ? ` +${names.length - maxShow} more` : "";
              return (
                <p key={d.id} className="leading-relaxed">
                  <span className="text-white">{d.name}</span>
                  <span className="text-white/40">: {shown}{more}</span>
                </p>
              );
            })}
            {patterns.map((d) => (
              <p key={d.id} className="leading-relaxed">
                <span className="text-yellow-400">★</span>{" "}
                <span className="text-white">{d.name}</span>
              </p>
            ))}
            <br />
          </>
        )}

        {/* Pioneer badge */}
        {score.pioneer.isPioneer && score.pioneer.innovations.length > 0 && (
          <>
            <p className="font-bold text-yellow-400">★ Pioneer Badge</p>
            <p className="text-yellow-400/70">
              {"  "}{score.pioneer.innovations.length} innovation(s) detected
            </p>
            {score.pioneer.innovations.map((inn) => (
              <p key={inn.id} className="text-yellow-400/70">
                {"  → "}{PIONEER_HOOKS[inn.id] ?? inn.name}
              </p>
            ))}
            <br />
          </>
        )}

        {/* GROWTH AREAS */}
        {weakest.length > 0 && (
          <>
            <p className="font-bold text-white">GROWTH AREAS</p>
            <p className="text-white/30">{LIGHT_SEP}</p>
            <br />
            {weakest.map((w) => (
              <div key={w.category} className="mb-2">
                <p className="leading-relaxed">
                  <span>{CATEGORY_EMOJI[w.category]}</span>{" "}
                  <span className="text-white">{CATEGORY_LABELS[w.category]}</span>{" "}
                  <span className="text-white/40">({w.score}/100)</span>
                </p>
                <p className="pl-6 text-white/40">
                  {commentaryForScoreWeb(w.category, w.score)}
                </p>
              </div>
            ))}
            <br />
          </>
        )}

        {/* Next tier hint */}
        {nextTier && (
          <>
            <p className="text-white/40">
              Next tier: {nextTier.title} (level {nextTier.minLevel}+)
            </p>
            <br />
          </>
        )}

        {/* Bottom separator */}
        <p className="text-white/30">{HEAVY_SEP}</p>
        <br />

        {/* Footer actions */}
        <div className="flex flex-col items-start gap-3">
          <CopyUrlButton />
          <p className="text-white/30">
            Get your own score:{" "}
            <span className="text-indigo-300">
              npx vibecheck-score
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
