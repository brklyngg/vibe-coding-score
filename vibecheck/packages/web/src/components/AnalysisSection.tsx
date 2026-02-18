"use client";

import { useEffect, useState, useCallback } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AnalysisSection({ handle, mockAnalysis }: { handle: string; mockAnalysis?: string }) {
  // Mock analysis: static render, no hooks needed
  if (mockAnalysis) {
    return (
      <>
        <p className="font-bold text-white">DETAILED ANALYSIS</p>
        <p className="text-white/30">{"─".repeat(52)}</p>
        <br />
        <div className="text-white/80 whitespace-pre-wrap leading-relaxed">
          {mockAnalysis}
        </div>
        <br />
      </>
    );
  }

  return <LiveAnalysis handle={handle} />;
}

function LiveAnalysis({ handle }: { handle: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);

  // Extract token from URL or localStorage
  useEffect(() => {
    const storageKey = `vibecheck-token-${handle}`;
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");

    if (urlToken) {
      localStorage.setItem(storageKey, urlToken);
      setToken(urlToken);
      // Clean URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
    } else {
      const stored = localStorage.getItem(storageKey);
      if (stored) setToken(stored);
    }
  }, [handle]);

  // Fetch analysis when token is available
  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    fetch(`/api/analysis/${handle}?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `Error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setAnalysis(data.analysis);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [handle, token]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!token || streaming) return;

      const userMsg: Message = { role: "user", content };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setStreaming(true);

      try {
        const res = await fetch(
          `/api/analysis/${handle}/chat?token=${encodeURIComponent(token)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: newMessages }),
          }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `Error ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No stream");

        const decoder = new TextDecoder();
        let assistantText = "";

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: assistantText };
            return updated;
          });
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${err instanceof Error ? err.message : "Unknown error"}` },
        ]);
      } finally {
        setStreaming(false);
      }
    },
    [handle, token, messages, streaming]
  );

  // No token = public view, render nothing
  if (!token) return null;

  return (
    <>
      <p className="font-bold text-white">DETAILED ANALYSIS</p>
      <p className="text-white/30">{"─".repeat(52)}</p>
      <br />

      {loading && (
        <p className="text-white/40 animate-pulse">Generating analysis...</p>
      )}

      {error && (
        <p className="text-red-400">{error}</p>
      )}

      {analysis && (
        <div className="text-white/80 whitespace-pre-wrap leading-relaxed">
          {analysis}
        </div>
      )}

      {analysis && (
        <>
          <br />
          <p className="text-white/50 text-sm mb-2">Ask about your setup:</p>
          <div className="border border-white/10 rounded bg-[#161b22] p-3">
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}
            <ChatInput onSend={sendMessage} disabled={streaming} />
          </div>
        </>
      )}

      <br />
    </>
  );
}
