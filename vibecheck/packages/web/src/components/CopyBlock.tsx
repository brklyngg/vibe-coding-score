"use client";
import { useState } from "react";

export function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-white/60">
        {text}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/40 hover:text-white/70"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
