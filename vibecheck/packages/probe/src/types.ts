export const TAXONOMY_CATEGORIES = [
  "intelligence",
  "tooling",
  "continuity",
  "autonomy",
  "ship",
  "security",
  "ops",
  "social",
] as const;

export type TaxonomyCategory = (typeof TAXONOMY_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<TaxonomyCategory, string> = {
  intelligence: "Intelligence",
  tooling: "Tooling",
  continuity: "Continuity",
  autonomy: "Autonomy",
  ship: "Ship",
  security: "Security",
  ops: "Ops",
  social: "Social",
};

export const CATEGORY_EMOJI: Record<TaxonomyCategory, string> = {
  intelligence: "🧠",
  tooling: "🔧",
  continuity: "🔄",
  autonomy: "🤖",
  ship: "🚀",
  security: "🛡️",
  ops: "📊",
  social: "🌐",
};

export const CATEGORY_WEIGHTS: Record<TaxonomyCategory, number> = {
  intelligence: 0.15,
  tooling: 0.15,
  continuity: 0.13,
  autonomy: 0.15,
  ship: 0.15,
  security: 0.12,
  ops: 0.10,
  social: 0.05,
};

export type DetectionTier = "basic" | "intermediate" | "advanced" | "elite";

export const TIER_POINTS: Record<DetectionTier, number> = {
  basic: 5,
  intermediate: 15,
  advanced: 25,
  elite: 35,
};

export interface Detection {
  id: string;
  category: TaxonomyCategory;
  name: string;
  source: string;
  confidence: "high" | "medium" | "low";
  tier: DetectionTier;
  taxonomyMatch: string | null; // null = innovation candidate
  details?: Record<string, unknown>;
  points?: number; // exact point value (overrides tier-based points when present)
  scanScope?: "project" | "workspace" | "global"; // where the detection was found
}

export interface ScanResult {
  scanner: string;
  detections: Detection[];
  duration: number; // ms
}

export interface CategoryScore {
  category: TaxonomyCategory;
  score: number; // 0-100
  detectionCount: number;
  topTier: DetectionTier;
}

export const TIER_TITLES = [
  { min: 0, max: 10, title: "Observer", tagline: "A tourist in the land of code" },
  { min: 11, max: 20, title: "Apprentice", tagline: "The AI is just a very chatty GPS" },
  { min: 21, max: 30, title: "Practitioner", tagline: "You crossed into YOLO mode" },
  { min: 31, max: 45, title: "Builder", tagline: "The AI becomes a partner" },
  { min: 46, max: 55, title: "Operator", tagline: "You stop typing syntax. You become a manager" },
  { min: 56, max: 65, title: "Commander", tagline: "Managing a parallel workforce" },
  { min: 66, max: 75, title: "Architect", tagline: "You aren't coding anymore" },
  { min: 76, max: 85, title: "Orchestrator", tagline: "Orchestrating a system of digital workers" },
  { min: 86, max: 100, title: "Industrialist", tagline: "A self-sustaining software factory" },
] as const;

export type TierTitle = (typeof TIER_TITLES)[number]["title"];

export interface TypeCode {
  code: string; // e.g. "MARD"
  intelligence: "M" | "V"; // Master strategist / Velocity seeker
  autonomy: "A" | "G"; // Autonomous / Guided
  ship: "R" | "C"; // Rapid / Cautious
  depth: "D" | "L"; // Deep / Light
}

export interface PioneerStatus {
  isPioneer: boolean;
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  innovations: Detection[];
}

export interface ScoreResult {
  level: number; // 0-100
  categories: CategoryScore[];
  tier: { title: TierTitle; tagline: string };
  typeCode: TypeCode;
  pioneer: PioneerStatus;
}

export interface ProbeResult {
  version: string;
  timestamp: string;
  platform: string;
  scanResults: ScanResult[];
  detections: Detection[];
  score: ScoreResult;
}
