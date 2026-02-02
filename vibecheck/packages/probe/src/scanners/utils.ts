import { exec } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { constants } from "node:fs";

export function expandHome(p: string): string {
  if (p.startsWith("~/")) return p.replace("~", homedir());
  if (p === "~") return homedir();
  return p;
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(expandHome(path), constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export async function readFileIfExists(path: string): Promise<string | null> {
  try {
    return await readFile(expandHome(path), "utf-8");
  } catch {
    return null;
  }
}

export async function readJsonIfExists<T>(path: string): Promise<T | null> {
  const content = await readFileIfExists(path);
  if (content === null) return null;
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export function shellOutput(
  cmd: string,
  timeoutMs = 5000
): Promise<string | null> {
  return new Promise((resolve) => {
    exec(cmd, { timeout: timeoutMs }, (error, stdout) => {
      if (error) {
        resolve(null);
        return;
      }
      resolve(stdout.trim());
    });
  });
}
