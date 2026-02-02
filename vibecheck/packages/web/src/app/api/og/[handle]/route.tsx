import { ImageResponse } from "next/og";
import { ScoreCard } from "@/lib/satori-card";
import { MOCK_SCORE } from "@/lib/mock-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  // TODO: Look up real score from Supabase by handle
  // For now, use mock data
  const score = MOCK_SCORE;

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
