"use client";

export function CopyUrlButton() {
  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // fallback: do nothing
    }
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition hover:bg-white/10"
    >
      Copy share URL
    </button>
  );
}
