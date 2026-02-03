import { readdir } from "node:fs/promises";
import type { ScanResult } from "../types.js";
import type { Scanner } from "./index.js";
import { classify, type RawFinding } from "../taxonomy/classifier.js";
import { fileExists, readJsonIfExists, readFileIfExists } from "./utils.js";

interface TsConfig {
  compilerOptions?: { strict?: boolean; [key: string]: unknown };
  [key: string]: unknown;
}

interface PackageJson {
  scripts?: Record<string, string>;
  devDependencies?: Record<string, string>;
  dependencies?: Record<string, string>;
  [key: string]: unknown;
}

export class RepositoriesScanner implements Scanner {
  name = "repositories";

  async scan(): Promise<ScanResult> {
    const start = performance.now();
    const findings: RawFinding[] = [];

    // GitHub Actions workflows
    try {
      const workflows = await readdir(".github/workflows");
      const ymlFiles = workflows.filter(
        (f) => f.endsWith(".yml") || f.endsWith(".yaml")
      );
      if (ymlFiles.length > 0) {
        findings.push({
          id: "github-actions",
          source: ".github/workflows/",
          confidence: "high",
          details: { workflowCount: ymlFiles.length },
        });
      }
    } catch {
      // no workflows dir
    }

    // Test framework configs
    const testConfigs = [
      { glob: "vitest.config", id: "vitest" },
      { glob: "jest.config", id: "jest" },
      { glob: "pytest.ini", id: "pytest" },
    ] as const;

    for (const { glob, id } of testConfigs) {
      const extensions = ["", ".ts", ".js", ".mjs", ".cjs"];
      for (const ext of extensions) {
        if (await fileExists(`${glob}${ext}`)) {
          findings.push({ id, source: `${glob}${ext}`, confidence: "high" });
          break;
        }
      }
    }

    // E2E test framework configs
    const e2eConfigs = [
      { glob: "playwright.config", id: "playwright" },
      { glob: "cypress.config", id: "cypress" },
    ] as const;

    for (const { glob, id } of e2eConfigs) {
      const extensions = ["", ".ts", ".js", ".mjs", ".cjs"];
      for (const ext of extensions) {
        if (await fileExists(`${glob}${ext}`)) {
          findings.push({ id, source: `${glob}${ext}`, confidence: "high" });
          break;
        }
      }
    }

    // Code quality configs
    const codeQualityConfigs = [
      { globs: ["eslint.config.js", "eslint.config.mjs", "eslint.config.cjs", "eslint.config.ts", ".eslintrc", ".eslintrc.js", ".eslintrc.json", ".eslintrc.yml"], id: "eslint" },
      { globs: ["prettier.config.js", "prettier.config.mjs", "prettier.config.cjs", ".prettierrc", ".prettierrc.js", ".prettierrc.json", ".prettierrc.yml"], id: "prettier" },
      { globs: ["biome.json", "biome.jsonc"], id: "biome" },
    ] as const;

    for (const { globs, id } of codeQualityConfigs) {
      for (const file of globs) {
        if (await fileExists(file)) {
          findings.push({ id, source: file, confidence: "high" });
          break;
        }
      }
    }

    // TypeScript strict mode
    const tsconfig = await readJsonIfExists<TsConfig>("tsconfig.json");
    if (tsconfig?.compilerOptions?.strict === true) {
      findings.push({
        id: "typescript-strict",
        source: "tsconfig.json",
        confidence: "high",
      });
    }

    // Also check pyproject.toml for pytest
    const pyproject = await readFileIfExists("pyproject.toml");
    if (pyproject && /\[tool\.pytest/i.test(pyproject)) {
      const hasPytest = findings.some((f) => f.id === "pytest");
      if (!hasPytest) {
        findings.push({
          id: "pytest",
          source: "pyproject.toml",
          confidence: "high",
        });
      }
    }

    // Package.json scripts analysis
    const pkg = await readJsonIfExists<PackageJson>("package.json");
    if (pkg?.scripts) {
      const scriptNames = Object.keys(pkg.scripts);
      const scriptValues = Object.values(pkg.scripts);

      // npm-scripts detection
      const hasDevOps = scriptNames.some((s) =>
        /^(build|dev|lint|start|test|format|typecheck)$/.test(s)
      );
      if (hasDevOps) {
        findings.push({
          id: "npm-scripts",
          source: "package.json",
          confidence: "high",
          details: { scripts: scriptNames },
        });
      }

      // Maintenance scripts
      const hasMaintenance = scriptNames.some((s) =>
        /clean|migrate|seed|reset|setup|postinstall/.test(s)
      );
      if (hasMaintenance) {
        findings.push({
          id: "maintenance-scripts",
          source: "package.json",
          confidence: "medium",
        });
      }

      // Kanban integration
      const hasKanban = scriptValues.some((v) =>
        /linear|jira|notion|asana/i.test(v)
      );
      if (hasKanban) {
        findings.push({
          id: "kanban-integration",
          source: "package.json",
          confidence: "medium",
        });
      }

      // Automated docs
      const hasDocs = scriptValues.some((v) =>
        /typedoc|jsdoc|storybook|docusaurus/i.test(v)
      );
      if (hasDocs) {
        findings.push({
          id: "automated-docs",
          source: "package.json",
          confidence: "high",
        });
      }

      // Monitoring config
      const hasMonitoring = scriptValues.some((v) =>
        /sentry|datadog|newrelic/i.test(v)
      );
      const deps = {
        ...(pkg.dependencies ?? {}),
        ...(pkg.devDependencies ?? {}),
      };
      const hasMonitoringDep = Object.keys(deps).some((d) =>
        /sentry|datadog|newrelic/i.test(d)
      );
      if (hasMonitoring || hasMonitoringDep) {
        findings.push({
          id: "monitoring-config",
          source: "package.json",
          confidence: "medium",
        });
      }
    }

    // Makefile / scripts directory
    if (await fileExists("Makefile")) {
      const hasMaintenance = findings.some(
        (f) => f.id === "maintenance-scripts"
      );
      if (!hasMaintenance) {
        findings.push({
          id: "maintenance-scripts",
          source: "Makefile",
          confidence: "medium",
        });
      }
    }

    try {
      await readdir("scripts");
      const hasMaintenance = findings.some(
        (f) => f.id === "maintenance-scripts"
      );
      if (!hasMaintenance) {
        findings.push({
          id: "maintenance-scripts",
          source: "scripts/",
          confidence: "medium",
        });
      }
    } catch {
      // no scripts dir
    }

    // Documentation
    if (await fileExists("README.md")) {
      findings.push({
        id: "documentation",
        source: "README.md",
        confidence: "high",
      });
    }

    // Task tracking
    const claudeMd = await readFileIfExists("CLAUDE.md");
    if (claudeMd && /todo|task|backlog/i.test(claudeMd)) {
      findings.push({
        id: "task-tracking",
        source: "CLAUDE.md",
        confidence: "medium",
      });
    }

    // Monitoring config files
    const monitorConfigs = [
      "sentry.client.config.ts",
      "sentry.server.config.ts",
      "sentry.config.ts",
      "datadog.config.ts",
    ];
    for (const cfg of monitorConfigs) {
      if (await fileExists(cfg)) {
        const hasMonitoring = findings.some(
          (f) => f.id === "monitoring-config"
        );
        if (!hasMonitoring) {
          findings.push({
            id: "monitoring-config",
            source: cfg,
            confidence: "high",
          });
        }
        break;
      }
    }

    return {
      scanner: this.name,
      detections: classify(findings),
      duration: Math.round(performance.now() - start),
    };
  }
}
