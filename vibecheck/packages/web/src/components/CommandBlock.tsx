"use client";
import { useState } from "react";

export function CommandBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 font-mono text-lg">
        <span className="text-white/40">$ </span>
        <span className="text-indigo-300">{command}</span>
      </div>
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/40 hover:text-white/70"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
