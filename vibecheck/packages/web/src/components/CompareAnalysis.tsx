"use client";

import { useEffect, useState } from "react";

interface Props {
  handleA: string;
  handleB: string;
}

export function CompareAnalysis({ handleA, handleB }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [authenticatedHandle, setAuthenticatedHandle] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if viewer is authenticated for either handle
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");

    // Try URL token against both handles
    if (urlToken) {
      // Store for both handles so subsequent visits work
      localStorage.setItem(`vibecheck-token-${handleA}`, urlToken);
      localStorage.setItem(`vibecheck-token-${handleB}`, urlToken);
      setToken(urlToken);
      // We'll figure out which handle it belongs to on the API call
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
    }

    // Check localStorage for either handle
    const tokenA = localStorage.getItem(`vibecheck-token-${handleA}`);
    const tokenB = localStorage.getItem(`vibecheck-token-${handleB}`);

    if (tokenA) {
      setToken(tokenA);
      setAuthenticatedHandle(handleA);
    } else if (tokenB) {
      setToken(tokenB);
      setAuthenticatedHandle(handleB);
    }
  }, [handleA, handleB]);

  // Fetch comparative analysis
  useEffect(() => {
    if (!token || !authenticatedHandle) return;

    setLoading(true);
    setError(null);

    // Use the authenticated handle's analysis endpoint
    fetch(`/api/analysis/${authenticatedHandle}?token=${encodeURIComponent(token)}&compare=${authenticatedHandle === handleA ? handleB : handleA}`)
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
  }, [token, authenticatedHandle, handleA, handleB]);

  if (!token || !authenticatedHandle) return null;

  return (
    <>
      <p className="font-bold text-white">COMPARATIVE ANALYSIS</p>
      <p className="text-white/30">{"─".repeat(52)}</p>
      <br />

      {loading && (
        <p className="text-white/40 animate-pulse">Generating comparative analysis...</p>
      )}

      {error && (
        <p className="text-red-400">{error}</p>
      )}

      {analysis && (
        <div className="text-white/80 whitespace-pre-wrap leading-relaxed">
          {analysis}
        </div>
      )}

      <br />
    </>
  );
}
