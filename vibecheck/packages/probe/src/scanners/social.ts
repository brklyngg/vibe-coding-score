import type { ScanResult } from "@vibe/scoring";
import type { Scanner } from "./index.js";
import { classify, type RawFinding } from "../taxonomy/classifier.js";
import { shellOutput, readJsonIfExists, readFileIfExists } from "./utils.js";

interface PackageJson {
  name?: string;
  private?: boolean;
  [key: string]: unknown;
}

export class SocialScanner implements Scanner {
  name = "social";

  async scan(): Promise<ScanResult> {
    const start = performance.now();
    const findings: RawFinding[] = [];

    // git remote for github.com
    const remotes = await shellOutput("git remote -v");
    if (remotes && /github\.com/i.test(remotes)) {
      findings.push({
        id: "github-repos",
        source: "git remote -v",
        confidence: "medium",
      });
    }

    // package.json private field
    const pkg = await readJsonIfExists<PackageJson>("package.json");
    if (pkg && pkg.private === false) {
      findings.push({
        id: "npm-public",
        source: "package.json",
        confidence: "high",
        details: { packageName: pkg.name },
      });
    }

    // Slack/Discord webhook patterns in configs
    const configFiles = [
      ".env",
      ".env.local",
      "package.json",
    ];
    for (const file of configFiles) {
      const content = await readFileIfExists(file);
      if (!content) continue;

      if (/SLACK_WEBHOOK|slack.*webhook/i.test(content)) {
        findings.push({
          id: "slack-webhook",
          source: file,
          confidence: "medium",
        });
      }
      if (/DISCORD_WEBHOOK|DISCORD_BOT_TOKEN|discord.*webhook/i.test(content)) {
        findings.push({
          id: "discord-bot",
          source: file,
          confidence: "medium",
        });
      }
    }

    // npm org scope in package name
    if (pkg?.name && pkg.name.startsWith("@") && pkg.private !== true) {
      findings.push({
        id: "npm-public",
        source: "package.json",
        confidence: "medium",
        details: { scope: pkg.name.split("/")[0] },
      });
    }

    return {
      scanner: this.name,
      detections: classify(findings),
      duration: Math.round(performance.now() - start),
    };
  }
}
