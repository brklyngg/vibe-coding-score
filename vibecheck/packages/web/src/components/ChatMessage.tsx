"use client";

export function ChatMessage({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`mb-2 ${isUser ? "text-right" : "text-left"}`}>
      <span className={`text-xs ${isUser ? "text-indigo-400" : "text-green-400"}`}>
        {isUser ? "you" : "opus"}
      </span>
      <p className={`text-sm whitespace-pre-wrap ${isUser ? "text-white/70" : "text-white/80"}`}>
        {content || <span className="animate-pulse text-white/30">...</span>}
      </p>
    </div>
  );
}
