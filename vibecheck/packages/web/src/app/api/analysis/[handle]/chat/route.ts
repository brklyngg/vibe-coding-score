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
const RATE_LIMIT = 10; // messages per hour per handle
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { messages } = body as { messages?: Array<{ role: string; content: string }> };
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages required" }, { status: 400 });
  }

  // Fetch result and validate token
  const { data, error } = await getSupabase()
    .from("results")
    .select("submission_token, full_detections, probe_result, chat_count, chat_window_start")
    .eq("handle", handle)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Handle not found" }, { status: 404 });
  }

  if (data.submission_token !== token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  // Rate limiting
  const now = Date.now();
  const windowStart = data.chat_window_start ? new Date(data.chat_window_start).getTime() : 0;
  let chatCount = data.chat_count ?? 0;

  if (now - windowStart > RATE_WINDOW_MS) {
    // Reset window
    chatCount = 0;
    await getSupabase()
      .from("results")
      .update({ chat_count: 1, chat_window_start: new Date().toISOString() })
      .eq("handle", handle);
  } else if (chatCount >= RATE_LIMIT) {
    return NextResponse.json(
      { error: "Rate limit reached (10 messages/hour). Try again later." },
      { status: 429 }
    );
  } else {
    await getSupabase()
      .from("results")
      .update({ chat_count: chatCount + 1 })
      .eq("handle", handle);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Chat service not configured" }, { status: 503 });
  }

  const detections = data.full_detections ?? data.probe_result?.detections ?? [];
  const probeResult = data.probe_result;
  const score = probeResult?.score as Record<string, unknown> | undefined;

  const systemPrompt = `You are an expert AI coding workflow analyst helping @${handle} understand and improve their AI coding setup.

Their setup: Level ${score?.level ?? "?"} ${(score?.tier as Record<string, unknown>)?.title ?? ""}

Detection data (${detections.length} signals):
${JSON.stringify(detections, null, 2)}

Category scores:
${JSON.stringify(score?.categories ?? [], null, 2)}

Answer questions about their setup, suggest improvements, and reference their specific tools, MCP servers, and configurations by name. Be conversational, specific, and expert. Keep responses concise.`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const stream = await anthropic.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 512,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(new TextEncoder().encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("Anthropic chat error:", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
