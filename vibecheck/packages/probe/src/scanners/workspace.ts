import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileExists, readJsonIfExists } from "./utils.js";

const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", ".turbo", ".cache",
]);

interface PackageJson {
  workspaces?: string[] | { packages?: string[] };
  [key: string]: unknown;
}

const MONOREPO_INDICATORS = [
  "pnpm-workspace.yaml",
  "turbo.json",
  "nx.json",
  "lerna.json",
  "rush.json",
] as const;

export async function isMonorepo(root: string): Promise<boolean> {
  for (const indicator of MONOREPO_INDICATORS) {
    if (await fileExists(join(root, indicator))) return true;
  }
  const pkg = await readJsonIfExists<PackageJson>(join(root, "package.json"));
  if (pkg?.workspaces) return true;
  return false;
}

export async function discoverWorkspaces(root: string, cap = 20): Promise<string[]> {
  const mono = await isMonorepo(root);
  if (!mono) return [];

  const dirs: string[] = [];

  try {
    const level1 = await readdir(root, { withFileTypes: true });
    for (const d of level1) {
      if (!d.isDirectory() || SKIP_DIRS.has(d.name) || d.name.startsWith(".")) continue;
      const l1 = join(root, d.name);
      if (await fileExists(join(l1, "package.json"))) {
        dirs.push(l1);
        if (dirs.length >= cap) return dirs;
      }
      try {
        const level2 = await readdir(l1, { withFileTypes: true });
        for (const d2 of level2) {
          if (!d2.isDirectory() || SKIP_DIRS.has(d2.name) || d2.name.startsWith(".")) continue;
          const l2 = join(l1, d2.name);
          if (await fileExists(join(l2, "package.json"))) {
            dirs.push(l2);
            if (dirs.length >= cap) return dirs;
          }
        }
      } catch { /* not readable */ }
    }
  } catch { /* root not readable */ }

  return dirs;
}
