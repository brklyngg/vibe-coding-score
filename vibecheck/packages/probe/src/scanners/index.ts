import type { Detection, ScanResult } from "@vibe/scoring";

export interface Scanner {
  name: string;
  scan(): Promise<ScanResult>;
}

export async function runAllScanners(
  scanners: Scanner[]
): Promise<ScanResult[]> {
  const results = await Promise.allSettled(
    scanners.map(async (s) => {
      const start = performance.now();
      try {
        const result = await s.scan();
        return result;
      } catch (err) {
        const duration = Math.round(performance.now() - start);
        const msg =
          err instanceof Error ? err.message : String(err);
        console.error(`[scanner:${s.name}] failed: ${msg}`);
        return {
          scanner: s.name,
          detections: [] as Detection[],
          duration,
        } satisfies ScanResult;
      }
    })
  );

  return results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { scanner: "unknown", detections: [], duration: 0 }
  );
}
