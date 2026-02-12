import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: ReturnType<typeof createClient<any>> | null = null;
function getSupabase() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (_supabase ??= createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ));
}

const HANDLE_RE = /^[a-z0-9_-]{3,39}$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { handle, probeResult, submissionToken } = body as Record<string, unknown>;

  // Validate handle
  if (typeof handle !== "string" || !HANDLE_RE.test(handle)) {
    return NextResponse.json(
      { error: "handle must be 3-39 lowercase alphanumeric, hyphens, or underscores" },
      { status: 400 }
    );
  }

  // Validate token
  if (typeof submissionToken !== "string" || submissionToken.length === 0) {
    return NextResponse.json({ error: "submissionToken required" }, { status: 400 });
  }

  // Validate probeResult shape
  const pr = probeResult as Record<string, unknown> | undefined;
  const score = pr?.score as Record<string, unknown> | undefined;
  if (
    !pr ||
    !score ||
    typeof score.level !== "number" ||
    !Array.isArray(score.categories) ||
    !score.tier ||
    !Array.isArray(pr.detections)
  ) {
    return NextResponse.json(
      { error: "probeResult must include score.level, score.categories, score.tier, and detections" },
      { status: 400 }
    );
  }

  // Ownership check
  const { data: existing } = await getSupabase()
    .from("results")
    .select("submission_token")
    .eq("handle", handle)
    .single();

  if (existing && existing.submission_token !== submissionToken) {
    return NextResponse.json(
      { error: "This handle is owned by a different token" },
      { status: 403 }
    );
  }

  if (existing) {
    // Upsert: update existing row
    const { error } = await getSupabase()
      .from("results")
      .update({ probe_result: probeResult, updated_at: new Date().toISOString() })
      .eq("handle", handle);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    // Insert new row
    const { error } = await getSupabase().from("results").insert({
      handle,
      probe_result: probeResult,
      submission_token: submissionToken,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? request.headers.get("host") ?? "vibecheck-brklyngg.vercel.app";
  const proto = host.includes("localhost") ? "http" : "https";

  return NextResponse.json({
    success: true,
    url: `${proto}://${host}/result/${handle}`,
  });
}
