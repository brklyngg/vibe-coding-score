import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import chalk from "chalk";
import type { Detection } from "../types.js";

export async function confirmDetections(
  detections: Detection[]
): Promise<Detection[]> {
  const rl = createInterface({ input: stdin, output: stdout });

  try {
    console.log(chalk.bold("\n  Detected items:"));
    for (let i = 0; i < detections.length; i++) {
      const d = detections[i];
      const innovation = d.taxonomyMatch === null ? chalk.yellow(" *") : "";
      console.log(
        `  ${chalk.dim(`${i + 1}.`)} ${d.name}${innovation} ${chalk.dim(`(${d.source})`)}`
      );
    }

    console.log();
    const answer = await rl.question(
      chalk.bold("  Confirm detections? [Y/n/edit] ")
    );

    const normalized = answer.trim().toLowerCase();

    if (normalized === "n" || normalized === "no") {
      console.log(chalk.dim("  Scan cancelled."));
      return [];
    }

    if (normalized === "edit" || normalized === "e") {
      const removeStr = await rl.question(
        chalk.dim(
          "  Enter numbers to remove (comma-separated): "
        )
      );
      const toRemove = new Set(
        removeStr
          .split(",")
          .map((s) => parseInt(s.trim(), 10) - 1)
          .filter((n) => !isNaN(n) && n >= 0 && n < detections.length)
      );

      const filtered = detections.filter(
        (_, i) => !toRemove.has(i)
      );
      console.log(
        chalk.dim(`  Removed ${toRemove.size} item(s). ${filtered.length} remaining.`)
      );
      return filtered;
    }

    // Y or empty = confirm all
    return detections;
  } finally {
    rl.close();
  }
}
