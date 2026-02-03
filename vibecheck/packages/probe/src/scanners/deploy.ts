import { readdir } from "node:fs/promises";
import type { ScanResult } from "../types.js";
import type { Scanner } from "./index.js";
import { classify, type RawFinding } from "../taxonomy/classifier.js";
import { fileExists, readJsonIfExists, readFileIfExists, shellOutput } from "./utils.js";

interface PackageJson {
  scripts?: Record<string, string>;
  [key: string]: unknown;
}

export class DeployScanner implements Scanner {
  name = "deploy";

  async scan(): Promise<ScanResult> {
    const start = performance.now();
    const findings: RawFinding[] = [];

    // Deploy platform configs
    const deployConfigs = [
      { file: ".vercel/project.json", id: "vercel" },
      { file: "vercel.json", id: "vercel" },
      { file: "netlify.toml", id: "netlify" },
      { file: "fly.toml", id: "fly" },
      { file: "railway.json", id: "railway" },
      { file: "render.yaml", id: "render" },
      { file: "wrangler.toml", id: "cloudflare-workers" },
    ] as const;

    const seenDeploy = new Set<string>();
    for (const { file, id } of deployConfigs) {
      if (seenDeploy.has(id)) continue;
      if (await fileExists(file)) {
        seenDeploy.add(id);
        findings.push({
          id,
          source: file,
          confidence: "high",
        });
      }
    }

    // Docker
    const dockerFiles = [
      "Dockerfile",
      "docker-compose.yml",
      "docker-compose.yaml",
    ];
    for (const file of dockerFiles) {
      if (await fileExists(file)) {
        findings.push({
          id: "docker",
          source: file,
          confidence: "high",
        });
        break;
      }
    }

    // GitHub Actions deploy workflows
    try {
      const workflows = await readdir(".github/workflows");
      for (const wf of workflows) {
        if (!wf.endsWith(".yml") && !wf.endsWith(".yaml")) continue;
        const content = await readFileIfExists(
          `.github/workflows/${wf}`
        );
        if (
          content &&
          /deploy|release|publish|cd\b/i.test(content)
        ) {
          // Only add if we haven't already found github-actions
          const hasGHA = findings.some(
            (f) => f.id === "github-actions"
          );
          if (!hasGHA) {
            findings.push({
              id: "github-actions",
              source: `.github/workflows/${wf}`,
              confidence: "high",
              details: { type: "deploy" },
            });
          }
          break;
        }
      }
    } catch {
      // no workflows
    }

    // CLI-based deploy tools
    const cliChecks = [
      { cmd: "which vercel", id: "vercel" },
      { cmd: "which netlify", id: "netlify" },
      { cmd: "which wrangler", id: "cloudflare-workers" },
    ] as const;

    const cliResults = await Promise.all(
      cliChecks.map(({ cmd }) => shellOutput(cmd))
    );
    for (let i = 0; i < cliChecks.length; i++) {
      if (cliResults[i] && !seenDeploy.has(cliChecks[i].id)) {
        seenDeploy.add(cliChecks[i].id);
        findings.push({
          id: cliChecks[i].id,
          source: cliChecks[i].cmd,
          confidence: "medium",
        });
      }
    }

    // Package.json deploy/release scripts
    const pkg = await readJsonIfExists<PackageJson>("package.json");
    if (pkg?.scripts) {
      const deployScripts = Object.keys(pkg.scripts).filter((s) =>
        /deploy|release|publish|ship/i.test(s)
      );
      if (deployScripts.length > 0) {
        // If no platform config found, infer from scripts
        if (findings.length === 0) {
          const values = deployScripts.map(
            (s) => pkg.scripts![s]
          );
          const combined = values.join(" ");
          if (/vercel/i.test(combined)) {
            findings.push({
              id: "vercel",
              source: "package.json",
              confidence: "medium",
            });
          }
          if (/netlify/i.test(combined)) {
            findings.push({
              id: "netlify",
              source: "package.json",
              confidence: "medium",
            });
          }
        }
      }
    }

    // Multi-environment detection
    const envFiles = [
      ".env.production",
      ".env.staging",
      ".env.preview",
    ];
    let envCount = 0;
    for (const file of envFiles) {
      if (await fileExists(file)) envCount++;
    }
    if (envCount >= 2) {
      // Boost existing deploy findings — multi-env is a signal of maturity
      // but we don't add a separate detection for it
    }

    return {
      scanner: this.name,
      detections: classify(findings),
      duration: Math.round(performance.now() - start),
    };
  }
}
