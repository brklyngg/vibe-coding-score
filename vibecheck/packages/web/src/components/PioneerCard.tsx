"use client";

import type { ScoreResult } from "@vibe/scoring";

interface PioneerCardProps {
  score: ScoreResult;
  handle: string;
  imageUrl: string;
}

export function PioneerCard({ score, handle, imageUrl }: PioneerCardProps) {
  if (!score.pioneer.isPioneer) return null;

  return (
    <div className="relative">
      {/* Gold glow effect */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 opacity-30 blur-sm" />
      <div className="relative overflow-hidden rounded-xl border-2 border-yellow-500/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={`${handle}'s Vibe Coder Score`} className="w-full" />
      </div>
      {/* Innovation badge below card */}
      {score.pioneer.innovations.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm text-yellow-400/80">
          <span>🏔️</span>
          <span className="font-medium">Pioneer</span>
          <span className="text-yellow-400/50">·</span>
          <span className="text-yellow-400/60">{score.pioneer.innovations[0].name}</span>
        </div>
      )}
    </div>
  );
}
