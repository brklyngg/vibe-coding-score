import { randomBytes } from "node:crypto";
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
const CODE_RE = /^[a-z0-9]{6}$/;

async function handleExists(handle: string): Promise<boolean> {
  const { data } = await getSupabase()
    .from("results")
    .select("handle")
    .eq("handle", handle)
    .single();
  return data !== null;
}

function generateCode(): string {
  return randomBytes(3).toString("hex");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, handle, code } = body as Record<string, string>;

  if (action === "create") {
    if (typeof handle !== "string" || !HANDLE_RE.test(handle)) {
      return NextResponse.json({ error: "Invalid handle" }, { status: 400 });
    }

    if (!(await handleExists(handle))) {
      return NextResponse.json({ error: "Handle not found — submit first" }, { status: 404 });
    }

    // Generate code, retry once on collision
    let newCode = generateCode();
    let { error } = await getSupabase()
      .from("comparisons")
      .insert({ code: newCode, handle_a: handle });

    if (error?.code === "23505") {
      newCode = generateCode();
      ({ error } = await getSupabase()
        .from("comparisons")
        .insert({ code: newCode, handle_a: handle }));
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const host =
      process.env.VERCEL_PROJECT_PRODUCTION_URL ??
      request.headers.get("host") ??
      "vibecheck-zeta-pearl.vercel.app";
    const proto = host.includes("localhost") ? "http" : "https";

    return NextResponse.json({
      code: newCode,
      url: `${proto}://${host}/compare/${newCode}`,
    });
  }

  if (action === "join") {
    if (typeof code !== "string" || !CODE_RE.test(code)) {
      return NextResponse.json({ error: "Invalid comparison code" }, { status: 400 });
    }
    if (typeof handle !== "string" || !HANDLE_RE.test(handle)) {
      return NextResponse.json({ error: "Invalid handle" }, { status: 400 });
    }

    // Look up comparison
    const { data: comparison } = await getSupabase()
      .from("comparisons")
      .select("*")
      .eq("code", code)
      .single();

    if (!comparison) {
      return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
    }

    if (comparison.handle_b !== null) {
      return NextResponse.json({ error: "Comparison already has two participants" }, { status: 409 });
    }

    if (comparison.handle_a === handle) {
      return NextResponse.json({ error: "Cannot compare with yourself" }, { status: 400 });
    }

    if (!(await handleExists(handle))) {
      return NextResponse.json({ error: "Handle not found — submit first" }, { status: 404 });
    }

    // Update with race-condition guard
    const { error } = await getSupabase()
      .from("comparisons")
      .update({ handle_b: handle, joined_at: new Date().toISOString() })
      .eq("code", code)
      .is("handle_b", null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const host =
      process.env.VERCEL_PROJECT_PRODUCTION_URL ??
      request.headers.get("host") ??
      "vibecheck-zeta-pearl.vercel.app";
    const proto = host.includes("localhost") ? "http" : "https";

    return NextResponse.json({
      success: true,
      url: `${proto}://${host}/compare/${code}`,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
