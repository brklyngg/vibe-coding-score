import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

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
const DAILY_BUDGET = 200;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const token = request.nextUrl.searchParams.get("token");

  if (!HANDLE_RE.test(handle)) {
    return NextResponse.json({ error: "Invalid handle" }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 401 });
  }

  // Fetch result and validate token
  const { data, error } = await getSupabase()
    .from("results")
    .select("submission_token, full_detections, probe_result, analysis_text, analysis_generated_at")
    .eq("handle", handle)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Handle not found" }, { status: 404 });
  }

  if (data.submission_token !== token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  // Check cache (skip for comparative analysis)
  const compareHandle = request.nextUrl.searchParams.get("compare");
  if (!compareHandle && data.analysis_text && data.analysis_generated_at) {
    const cachedAt = new Date(data.analysis_generated_at).getTime();
    if (Date.now() - cachedAt < CACHE_TTL_MS) {
      return NextResponse.json({ analysis: data.analysis_text, cached: true });
    }
  }

  // Daily budget check
  const oneDayAgo = new Date(Date.now() - CACHE_TTL_MS).toISOString();
  const { count } = await getSupabase()
    .from("results")
    .select("*", { count: "exact", head: true })
    .gt("analysis_generated_at", oneDayAgo);

  if ((count ?? 0) >= DAILY_BUDGET) {
    return NextResponse.json(
      { error: "Daily analysis budget exceeded. Try again tomorrow." },
      { status: 503 }
    );
  }

  // Build detection data for analysis
  const detections = data.full_detections ?? data.probe_result?.detections ?? [];
  const probeResult = data.probe_result;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Analysis service not configured" }, { status: 503 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let prompt: string;

  if (compareHandle && HANDLE_RE.test(compareHandle)) {
    const { data: compareData } = await getSupabase()
      .from("results")
      .select("full_detections, probe_result")
      .eq("handle", compareHandle)
      .single();

    if (compareData) {
      const compareDetections = compareData.full_detections ?? compareData.probe_result?.detections ?? [];
      prompt = buildComparativePrompt(handle, probeResult, detections, compareHandle, compareData.probe_result, compareDetections);
    } else {
      prompt = buildAnalysisPrompt(handle, probeResult, detections);
    }
  } else {
    prompt = buildAnalysisPrompt(handle, probeResult, detections);
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const analysisText = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    // Cache in DB (skip for comparative analysis)
    if (!compareHandle) {
      await getSupabase()
        .from("results")
        .update({
          analysis_text: analysisText,
          analysis_generated_at: new Date().toISOString(),
        })
        .eq("handle", handle);
    }

    return NextResponse.json({ analysis: analysisText, cached: false });
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "Analysis generation failed" }, { status: 500 });
  }
}

function buildAnalysisPrompt(
  handle: string,
  probeResult: Record<string, unknown>,
  detections: unknown[]
): string {
  const score = probeResult?.score as Record<string, unknown> | undefined;
  const level = score?.level ?? "unknown";
  const tier = (score?.tier as Record<string, unknown>)?.title ?? "unknown";
  const categories = score?.categories ?? [];

  return `You are an expert AI coding workflow analyst. Analyze this developer's AI coding setup and provide personalized, actionable insights.

Developer: @${handle}
Level: ${level}
Tier: ${tier}

Category Scores:
${JSON.stringify(categories, null, 2)}

Full Detection Set (${detections.length} signals):
${JSON.stringify(detections, null, 2)}

Provide a concise analysis (3-5 paragraphs) that:
1. Identifies their strongest capabilities — reference specific MCP servers, tools, agents, and configurations by name
2. Highlights unique or impressive aspects of their setup
3. Identifies 2-3 specific, actionable recommendations for improvement — name specific tools, MCP servers, or practices they should adopt
4. Notes any interesting patterns in how they've composed their AI workflow

Be conversational but expert. Avoid generic advice — everything should reference their actual detection data. Don't use bullet points or headers — write in flowing prose.`;
}

function buildComparativePrompt(
  handleA: string,
  probeResultA: Record<string, unknown>,
  detectionsA: unknown[],
  handleB: string,
  probeResultB: Record<string, unknown>,
  detectionsB: unknown[]
): string {
  const scoreA = probeResultA?.score as Record<string, unknown> | undefined;
  const scoreB = probeResultB?.score as Record<string, unknown> | undefined;

  return `You are an expert AI coding workflow analyst. Compare these two developers' AI coding setups and provide insights on their differences and what each can learn from the other.

Developer A: @${handleA}
Level: ${scoreA?.level ?? "?"}, Tier: ${(scoreA?.tier as Record<string, unknown>)?.title ?? "?"}
Categories: ${JSON.stringify(scoreA?.categories ?? [])}
Detections (${detectionsA.length} signals): ${JSON.stringify(detectionsA)}

Developer B: @${handleB}
Level: ${scoreB?.level ?? "?"}, Tier: ${(scoreB?.tier as Record<string, unknown>)?.title ?? "?"}
Categories: ${JSON.stringify(scoreB?.categories ?? [])}
Detections (${detectionsB.length} signals): ${JSON.stringify(detectionsB)}

Provide a concise comparative analysis (3-4 paragraphs) that:
1. Highlights where each developer excels relative to the other — reference specific tools, MCP servers, and configurations by name
2. Identifies what each could adopt from the other's setup
3. Notes complementary strengths that would make them an effective pairing

Be conversational but expert. Reference specific detection data. Write in flowing prose, no bullet points or headers.`;
}
