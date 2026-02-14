import type {
  Detection,
  TaxonomyCategory,
  DetectionTier,
} from "@vibe/scoring";
import registryData from "./registry.json" with { type: "json" };

export interface RawFinding {
  id: string;
  source: string;
  confidence?: "high" | "medium" | "low";
  details?: Record<string, unknown>;
}

interface RegistryEntry {
  id: string;
  name: string;
  category: TaxonomyCategory;
  tier: DetectionTier;
  signals: string[];
}

let registry: Map<string, RegistryEntry> | null = null;

function getRegistry(): Map<string, RegistryEntry> {
  if (registry) return registry;
  registry = new Map<string, RegistryEntry>();
  for (const entry of registryData as RegistryEntry[]) {
    registry.set(entry.id, entry);
  }
  return registry;
}

export function classify(findings: RawFinding[]): Detection[] {
  const reg = getRegistry();
  const detections: Detection[] = [];

  for (const finding of findings) {
    const entry = reg.get(finding.id);

    if (entry) {
      detections.push({
        id: finding.id,
        category: entry.category,
        name: entry.name,
        source: finding.source,
        confidence: finding.confidence ?? "high",
        tier: entry.tier,
        taxonomyMatch: entry.id,
        details: finding.details,
      });
    } else {
      detections.push({
        id: finding.id,
        category: "tooling",
        name: finding.id,
        source: finding.source,
        confidence: finding.confidence ?? "medium",
        tier: "advanced",
        taxonomyMatch: null,
        details: finding.details,
      });
    }
  }

  return detections;
}
