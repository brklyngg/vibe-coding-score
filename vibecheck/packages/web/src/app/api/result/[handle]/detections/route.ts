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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;

  if (!HANDLE_RE.test(handle)) {
    return NextResponse.json(
      { error: "Invalid handle format" },
      { status: 400 }
    );
  }

  const { data, error } = await getSupabase()
    .from("results")
    .select("probe_result")
    .eq("handle", handle)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Handle not found" },
      { status: 404 }
    );
  }

  const probeResult = data.probe_result as Record<string, unknown>;
  const detections = Array.isArray(probeResult?.detections)
    ? probeResult.detections
    : [];

  return NextResponse.json({ detections });
}
