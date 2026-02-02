import type { ScanResult } from "../types.js";
import type { Scanner } from "./index.js";
import { classify, type RawFinding } from "../taxonomy/classifier.js";
import { readFileIfExists, shellOutput } from "./utils.js";

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

const SHELL_FILES = [
  "~/.zshrc",
  "~/.bashrc",
  "~/.zprofile",
  "~/.bash_profile",
];

export class EnvironmentScanner implements Scanner {
  name = "environment";

  async scan(): Promise<ScanResult> {
    const start = performance.now();
    const findings: RawFinding[] = [];
    const seen = new Set<string>();

    // Read shell config files
    const contents: string[] = [];
    for (const file of SHELL_FILES) {
      const content = await readFileIfExists(file);
      if (content) contents.push(content);
    }
    const combined = contents.join("\n");

    // Detect API key exports (presence only, NEVER values)
    for (const [envVar, detectionId] of Object.entries(API_KEY_MAP)) {
      if (seen.has(detectionId)) continue;
      const pattern = new RegExp(
        `(export\\s+)?${envVar}\\s*=`,
        "m"
      );
      if (pattern.test(combined)) {
        seen.add(detectionId);
        findings.push({
          id: detectionId,
          source: "shell config",
          confidence: "high",
        });
      }
    }

    // Detect model routing aliases
    const aliasPattern = /alias\s+(\w+).*model/gi;
    const aliases: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = aliasPattern.exec(combined)) !== null) {
      aliases.push(match[1]);
    }
    if (aliases.length > 0) {
      findings.push({
        id: "model-routing",
        source: "shell config",
        confidence: "medium",
        details: { aliases },
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
