import type { Scanner } from "./index.js";
import type { Detection, ScanResult, TaxonomyCategory, DetectionTier } from "@vibe/scoring";
import { shellOutput } from "./utils.js";

// ── Internal Types ──────────────────────────────────────────────────

interface GitCommit {
  hash: string;
  subject: string;
  authorName: string;
  authorDate: Date;
  committerName: string;
}

interface FileChange {
  insertions: number;
  deletions: number;
  path: string;
}

interface CommitStats {
  hash: string;
  files: FileChange[];
  totalInsertions: number;
  totalDeletions: number;
}

type CommitType =
  | "conventional"
  | "ai_generated"
  | "descriptive"
  | "wip"
  | "ai_attributed";

type WorkPattern = "night_owl" | "early_bird" | "9_to_5" | "always_on";

// ── Parsers ─────────────────────────────────────────────────────────

function parseCommitLog(raw: string): GitCommit[] {
  const commits: GitCommit[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    const parts = line.split("\0");
    if (parts.length < 5) continue;
    commits.push({
      hash: parts[0],
      subject: parts[1],
      authorName: parts[2],
      authorDate: new Date(parts[3]),
      committerName: parts[4],
    });
  }
  return commits;
}

function parseNumstat(raw: string): CommitStats[] {
  const stats: CommitStats[] = [];
  let current: CommitStats | null = null;

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 40-char hex hash = new commit boundary
    if (/^[0-9a-f]{40}$/.test(trimmed)) {
      if (current) stats.push(current);
      current = { hash: trimmed, files: [], totalInsertions: 0, totalDeletions: 0 };
      continue;
    }

    if (!current) continue;

    // numstat line: insertions\tdeletions\tpath (binary = -\t-\tpath)
    const match = trimmed.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
    if (!match) continue;
    if (match[1] === "-" || match[2] === "-") continue; // binary

    const ins = parseInt(match[1], 10);
    const del = parseInt(match[2], 10);
    current.files.push({ insertions: ins, deletions: del, path: match[3] });
    current.totalInsertions += ins;
    current.totalDeletions += del;
  }

  if (current) stats.push(current);
  return stats;
}

function parseBranches(raw: string): string[] {
  return raw.split("\n").map((b) => b.trim()).filter(Boolean);
}

function parseTags(raw: string): string[] {
  return raw.split("\n").map((t) => t.trim()).filter(Boolean);
}

// ── Commit Classifier ───────────────────────────────────────────────

const CONVENTIONAL_RE =
  /^(feat|fix|chore|docs|style|refactor|test|perf|ci|build|revert)(\(.+\))?!?:\s/;

const AI_ATTRIBUTION_RE =
  /co-authored-by:/i;

const AI_MARKERS_RE =
  /\[ai\]|\[claude\]|\[copilot\]|🤖/i;

const AI_GENERATED_RE =
  /^(Update|Fix|Add|Remove|Create|Implement|Refactor)\s\w+$/;

function classifyCommit(subject: string, fullMatch?: string): CommitType {
  const text = fullMatch ?? subject;
  // 1. AI attributed
  if (AI_ATTRIBUTION_RE.test(text) || AI_MARKERS_RE.test(subject)) {
    return "ai_attributed";
  }
  // 2. Conventional
  if (CONVENTIONAL_RE.test(subject)) return "conventional";
  // 3. WIP
  const lower = subject.trim().toLowerCase();
  if (/^(wip|tmp|asdf|fixup!|squash!)$/i.test(lower) || (lower.split(/\s+/).length === 1 && lower.length < 8)) {
    return "wip";
  }
  // 4. AI-generated (generic template AND short)
  if (AI_GENERATED_RE.test(subject) && subject.length < 30) {
    return "ai_generated";
  }
  // 5. Descriptive
  return "descriptive";
}

// ── Detection Builder ───────────────────────────────────────────────

function det(
  id: string,
  category: TaxonomyCategory,
  points: number,
  name: string,
  details: Record<string, unknown> = {}
): Detection {
  const tier: DetectionTier =
    points >= 10 ? "advanced" : points > 0 ? "intermediate" : "basic";
  return {
    id: `git:${id}`,
    category,
    name,
    source: "git-history",
    confidence: "high",
    tier,
    taxonomyMatch: `git:${id}`,
    points,
    details,
  };
}

// ── Analysis Functions ──────────────────────────────────────────────

function analyzeCommitMessages(
  commits: GitCommit[],
  detections: Detection[]
): void {
  if (commits.length === 0) return;

  const types = commits.map((c) => classifyCommit(c.subject));
  const counts: Record<CommitType, number> = {
    conventional: 0,
    ai_generated: 0,
    descriptive: 0,
    wip: 0,
    ai_attributed: 0,
  };
  for (const t of types) counts[t]++;

  const total = commits.length;
  const pct = (n: number) => Math.round((n / total) * 100);

  if (counts.conventional / total > 0.5) {
    detections.push(
      det("conventional-commits", "ops", 10, "Conventional commits", {
        ratio: pct(counts.conventional),
      })
    );
  }

  if (counts.ai_attributed > 0) {
    detections.push(
      det("ai-attribution", "social", 5, "AI attribution in commits", {
        count: counts.ai_attributed,
      })
    );
  }

  if (counts.ai_generated / total > 0.8) {
    detections.push(
      det("ai-generated-dominant", "ops", -5, "AI-generated commit messages dominant", {
        ratio: pct(counts.ai_generated),
      })
    );
  }

  // AI co-author detection (check full subjects for Co-authored-by with AI names)
  const aiCoauthorRe =
    /co-authored-by:\s*.*(claude|copilot|gpt|gemini|cursor|openai|anthropic|github-actions|dependabot)/i;
  const aiCoauthorCount = commits.filter((c) => aiCoauthorRe.test(c.subject)).length;
  if (aiCoauthorCount > 0) {
    detections.push(
      det("ai-coauthor", "intelligence", 5, "AI co-author in commits", {
        count: aiCoauthorCount,
      })
    );
  }
}

function analyzeCommitVelocity(
  commits: GitCommit[],
  statsMap: Map<string, CommitStats>,
  detections: Detection[]
): void {
  if (commits.length === 0) return;

  // Bimodal size distribution
  const sizes = commits.map((c) => {
    const s = statsMap.get(c.hash);
    return s ? s.totalInsertions + s.totalDeletions : 0;
  });

  const small = sizes.filter((s) => s < 50).length;
  const medium = sizes.filter((s) => s >= 50 && s <= 300).length;
  const large = sizes.filter((s) => s > 300).length;
  const total = sizes.length;

  if (
    small / total > 0.3 &&
    large / total > 0.3 &&
    medium / total < 0.2
  ) {
    detections.push(
      det("bimodal-commits", "intelligence", 5, "Bimodal commit size distribution", {
        smallPct: Math.round((small / total) * 100),
        largePct: Math.round((large / total) * 100),
      })
    );
  }

  // 30-day velocity
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recent = commits.filter((c) => c.authorDate.getTime() > thirtyDaysAgo);

  if (recent.length === 0) {
    detections.push(
      det("stale-repo", "ship", -10, "Stale repository (0 commits in 30 days)")
    );
    return;
  }

  const weeks = 30 / 7;
  const perWeek = recent.length / weeks;
  if (perWeek > 5) {
    detections.push(
      det("active-velocity", "ship", 10, "Active commit velocity", {
        commitsPerWeek: Math.round(perWeek * 10) / 10,
        last30d: recent.length,
      })
    );
  }
}

function analyzeBranchStrategy(
  branches: string[],
  tags: string[],
  detections: Detection[]
): void {
  const featureBranches = branches.filter((b) =>
    /^(feature|fix)\//.test(b) || /^origin\/(feature|fix)\//.test(b)
  );
  if (featureBranches.length > 0) {
    detections.push(
      det("feature-branches", "ops", 5, "Feature/fix branch naming", {
        count: featureBranches.length,
      })
    );
  }

  const releaseBranches = branches.filter((b) =>
    /release\//.test(b) || /^origin\/release\//.test(b)
  );
  const semverTags = tags.filter((t) => /^v?\d+\.\d+\.\d+/.test(t));
  if (releaseBranches.length > 0 && semverTags.length > 0) {
    detections.push(
      det("release-engineering", "ship", 10, "Release engineering", {
        releaseBranches: releaseBranches.length,
        semverTags: semverTags.length,
      })
    );
  }

  const mainBranches = new Set(["main", "master", "develop", "origin/main", "origin/master", "origin/develop"]);
  const nonMainline = branches.filter((b) => !mainBranches.has(b));
  if (nonMainline.length > 10) {
    detections.push(
      det("chaotic-branches", "ops", -3, "Chaotic branch sprawl", {
        count: nonMainline.length,
      })
    );
  }
}

function analyzeFileTypeDistribution(
  commits: GitCommit[],
  statsMap: Map<string, CommitStats>,
  detections: Detection[]
): void {
  if (commits.length === 0) return;

  const testRe = /\.(test|spec)\.(ts|tsx|js|jsx)$|__tests__\/|\/test\//;
  const docRe = /\.(md|rst|txt|adoc)$|docs?\//i;

  let commitsWithTests = 0;
  let commitsWithDocs = 0;

  for (const c of commits) {
    const s = statsMap.get(c.hash);
    if (!s) continue;
    const paths = s.files.map((f) => f.path);
    if (paths.some((p) => testRe.test(p))) commitsWithTests++;
    if (paths.some((p) => docRe.test(p))) commitsWithDocs++;
  }

  const total = commits.length;
  if (commitsWithTests / total > 0.2) {
    detections.push(
      det("test-in-commits", "ship", 10, "Tests included in commits", {
        ratio: Math.round((commitsWithTests / total) * 100),
      })
    );
  }

  if (commitsWithDocs / total > 0.1) {
    detections.push(
      det("docs-in-commits", "ops", 5, "Docs included in commits", {
        ratio: Math.round((commitsWithDocs / total) * 100),
      })
    );
  }
}

function analyzeTimeOfDay(
  commits: GitCommit[],
  detections: Detection[]
): void {
  if (commits.length === 0) return;

  const histogram = new Array<number>(24).fill(0);
  for (const c of commits) {
    histogram[c.authorDate.getHours()]++;
  }

  // Determine work pattern
  const night = histogram.slice(0, 6).reduce((a, b) => a + b, 0); // 0-5
  const morning = histogram.slice(6, 12).reduce((a, b) => a + b, 0); // 6-11
  const afternoon = histogram.slice(12, 18).reduce((a, b) => a + b, 0); // 12-17
  const evening = histogram.slice(18, 24).reduce((a, b) => a + b, 0); // 18-23
  const total = commits.length;

  let pattern: WorkPattern = "always_on";
  const nineTo5 = morning + afternoon;
  if (nineTo5 / total > 0.8) {
    pattern = "9_to_5";
  } else if ((evening + night) / total > 0.6) {
    pattern = "night_owl";
  } else if (morning / total > 0.5) {
    pattern = "early_bird";
  }

  detections.push(
    det("time-pattern", "ops", 0, "Commit time pattern", {
      pattern,
      histogram,
      morning,
      afternoon,
      evening,
      night,
    })
  );
}

// ── Scanner ─────────────────────────────────────────────────────────

export class GitHistoryScanner implements Scanner {
  readonly name = "git-history";

  async scan(): Promise<ScanResult> {
    const start = performance.now();
    const detections: Detection[] = [];

    // Guard: skip if not a git repo
    const isGit = await shellOutput("git rev-parse --is-inside-work-tree", 5000);
    if (isGit !== "true") {
      return { scanner: this.name, detections, duration: Math.round(performance.now() - start) };
    }

    // Run git commands in parallel
    const [logRaw, numstatRaw, branchRaw, tagRaw] = await Promise.all([
      shellOutput(
        "git log --format='%H%x00%s%x00%an%x00%ai%x00%cn' -500",
        10000
      ),
      shellOutput("git log --format='%H' --numstat -500", 10000),
      shellOutput("git branch -a --format='%(refname:short)'", 5000),
      shellOutput("git tag --list", 5000),
    ]);

    // Parse
    const commits = logRaw ? parseCommitLog(logRaw) : [];
    if (commits.length === 0) {
      return { scanner: this.name, detections, duration: Math.round(performance.now() - start) };
    }

    const stats = numstatRaw ? parseNumstat(numstatRaw) : [];
    const statsMap = new Map(stats.map((s) => [s.hash, s]));
    const branches = branchRaw ? parseBranches(branchRaw) : [];
    const tags = tagRaw ? parseTags(tagRaw) : [];

    // Run analysis
    analyzeCommitMessages(commits, detections);
    analyzeCommitVelocity(commits, statsMap, detections);
    analyzeBranchStrategy(branches, tags, detections);
    analyzeFileTypeDistribution(commits, statsMap, detections);
    analyzeTimeOfDay(commits, detections);

    return {
      scanner: this.name,
      detections,
      duration: Math.round(performance.now() - start),
    };
  }
}
