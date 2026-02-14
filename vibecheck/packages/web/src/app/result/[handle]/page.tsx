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
  TIER_TAGLINES,
  ARCHETYPE_NAMES,
  ARCHETYPE_DESCRIPTIONS,
  DIMENSION_COMMENTARY,
  PIONEER_TAGLINE,
  PIONEER_HOOKS,
} from "@/lib/narrative-templates";
import { PioneerCard } from "@/components/PioneerCard";
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

function getCommentary(
  category: TaxonomyCategory,
  score: number
): string {
  const band = score >= 60 ? "high" : score >= 30 ? "mid" : "low";
  return DIMENSION_COMMENTARY[category][band];
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-indigo-400"
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="w-8 text-right text-sm text-white/50">{score}</span>
    </div>
  );
}

export default async function ResultPage({ params }: PageProps) {
  const { handle } = await params;
  const result = await getResult(handle) ?? (handle === "demo" ? MOCK_RESULT : null);
  if (!result) notFound();

  const { score, detections } = result;
  const archetype = ARCHETYPE_NAMES[score.typeCode.code] ?? "Unknown";
  const archetypeDesc = ARCHETYPE_DESCRIPTIONS[score.typeCode.code] ?? "";

  // Group detections by category
  const detectionsByCategory = new Map<TaxonomyCategory, Detection[]>();
  for (const d of detections) {
    const list = detectionsByCategory.get(d.category) ?? [];
    list.push(d);
    detectionsByCategory.set(d.category, list);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      {/* Hero */}
      <section className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-400">
          Level {score.level} · {score.typeCode.code}
        </p>
        <h1 className="mb-3 text-5xl font-extrabold tracking-tight">
          {score.tier.title}
        </h1>
        <p className="text-lg italic text-white/50">
          {TIER_TAGLINES[score.tier.title]}
        </p>
      </section>

      {/* Archetype */}
      <section className="mb-10 rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-1 text-xl font-bold">{archetype}</h2>
        <p className="text-sm text-white/60">{archetypeDesc}</p>
      </section>

      {/* 8 Categories */}
      <section className="mb-10 space-y-5">
        <h2 className="text-lg font-bold text-white/80">Dimensions</h2>
        {TAXONOMY_CATEGORIES.map((cat) => {
          const catScore = score.categories.find((c) => c.category === cat);
          const s = catScore?.score ?? 0;
          return (
            <div key={cat}>
              <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                <span>{CATEGORY_EMOJI[cat]}</span>
                <span>{CATEGORY_LABELS[cat]}</span>
              </div>
              <ScoreBar score={s} />
              <p className="mt-1 text-xs text-white/40">
                {getCommentary(cat, s)}
              </p>
            </div>
          );
        })}
      </section>

      {/* Detections */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold text-white/80">Detections</h2>
        {TAXONOMY_CATEGORIES.map((cat) => {
          const items = detectionsByCategory.get(cat);
          if (!items || items.length === 0) return null;
          return (
            <details key={cat} className="mb-2">
              <summary className="cursor-pointer text-sm font-medium text-white/60 hover:text-white/80">
                {CATEGORY_EMOJI[cat]} {CATEGORY_LABELS[cat]} ({items.length})
              </summary>
              <ul className="mt-1 ml-5 space-y-1">
                {items.map((d) => (
                  <li key={d.id} className="text-xs text-white/40">
                    {d.name}
                    <span className="ml-2 text-white/20">
                      {d.tier} · {d.source}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </section>

      {/* Pioneer Card */}
      {score.pioneer.isPioneer && (
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-bold text-yellow-400/80">
            Pioneer Status
          </h2>
          <p className="mb-4 text-sm italic text-yellow-400/60">
            {PIONEER_TAGLINE}
          </p>
          <PioneerCard
            score={score}
            handle={handle}
            imageUrl={`/api/og/${handle}`}
          />
          {score.pioneer.innovations.length > 0 && (
            <ul className="mt-3 space-y-1">
              {score.pioneer.innovations.map((inn) => {
                const hook = PIONEER_HOOKS[inn.id] ?? inn.name;
                return (
                  <li key={inn.id} className="text-xs text-yellow-400/50">
                    {hook}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 pt-6 text-center">
        <CopyUrlButton />
        <p className="mt-4 text-xs text-white/30">
          Get your own score:{" "}
          <code className="text-indigo-300">
            npx vibecheck-score --submit --handle yourname
          </code>
        </p>
      </footer>
    </main>
  );
}

