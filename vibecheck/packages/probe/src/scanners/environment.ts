import type { ScanResult } from "@vibe/scoring";
import type { Scanner } from "./index.js";
import { classify, type RawFinding } from "../taxonomy/classifier.js";
import { shellOutput } from "./utils.js";

const API_KEY_MAP: Record<string, string> = {
  ANTHROPIC_API_KEY: "anthropic-api-key",
  OPENAI_API_KEY: "openai-api-key",
  GOOGLE_API_KEY: "google-api-key",
  GEMINI_API_KEY: "google-api-key",
  XAI_API_KEY: "xai-api-key",
  MISTRAL_API_KEY: "mistral-api-key",
  TOGETHER_API_KEY: "together-api-key",
  GROQ_API_KEY: "groq-api-key",
  FIREWORKS_API_KEY: "fireworks-api-key",
  AZURE_OPENAI_API_KEY: "azure-openai-api-key",
};

const SHELL_FILES = "~/.zshrc ~/.bashrc ~/.zprofile ~/.bash_profile";

export class EnvironmentScanner implements Scanner {
  name = "environment";

  async scan(): Promise<ScanResult> {
    const start = performance.now();
    const findings: RawFinding[] = [];
    const seen = new Set<string>();

    // Detect API key exports in shell config (grep, never load values)
    for (const [envVar, detectionId] of Object.entries(API_KEY_MAP)) {
      if (seen.has(detectionId)) continue;
      const hit = await shellOutput(
        `grep -lE "^(export\\s+)?${envVar}\\s*=" ${SHELL_FILES} 2>/dev/null`
      );
      if (hit) {
        seen.add(detectionId);
        findings.push({
          id: detectionId,
          source: "shell config",
          confidence: "high",
        });
      }
    }

    // Scan .env and .env.local in CWD (grep per key per file)
    const envFiles = [".env", ".env.local"];
    for (const envFile of envFiles) {
      for (const [envVar, detectionId] of Object.entries(API_KEY_MAP)) {
        if (seen.has(detectionId)) continue;
        const count = await shellOutput(
          `grep -c "^${envVar}=" ${envFile} 2>/dev/null`
        );
        if (parseInt(count ?? "0") > 0) {
          seen.add(detectionId);
          findings.push({
            id: detectionId,
            source: envFile,
            confidence: "high",
          });
        }
      }
    }

    // Detect model routing aliases (count only, no names)
    const aliasCountRaw = await shellOutput(
      `grep -cE "alias\\s+\\w+.*model" ${SHELL_FILES} 2>/dev/null`
    );
    // grep -c with multiple files returns file:count per line; sum the counts
    const aliasCount = (aliasCountRaw ?? "")
      .split("\n")
      .reduce(
        (sum, line) =>
          sum + (parseInt(line.split(":").pop() ?? "0") || 0),
        0
      );
    if (aliasCount > 0) {
      findings.push({
        id: "model-routing",
        source: "shell config",
        confidence: "medium",
        details: { count: aliasCount },
      });
    }

    // Check for local model runners
    const [ollama, lms] = await Promise.all([
      shellOutput("which ollama"),
      shellOutput("which lms"),
    ]);

    if (ollama) {
      findings.push({
        id: "local-ollama",
        source: "which ollama",
        confidence: "high",
      });
    }
    if (lms) {
      findings.push({
        id: "local-lmstudio",
        source: "which lms",
        confidence: "high",
      });
    }

    return {
      scanner: this.name,
      detections: classify(findings),
      duration: Math.round(performance.now() - start),
    };
  }
}
