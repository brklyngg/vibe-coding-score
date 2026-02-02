import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { ScoreCard } from "@/lib/satori-card";
import { MOCK_SCORE } from "@/lib/mock-data";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  // Look up real score from Supabase, fall back to mock for "demo"
  const { data } = await supabase
    .from("results")
    .select("probe_result")
    .eq("handle", handle)
    .single();

  const score = data?.probe_result?.score ?? (handle === "demo" ? MOCK_SCORE : null);
  if (!score) {
    return new Response("Not found", { status: 404 });
  }

  try {
    return new ImageResponse(
      <ScoreCard score={score} handle={handle} />,
      {
        width: 600,
        height: 400,
      }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
