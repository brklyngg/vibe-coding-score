import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outfile: "dist/index.js",
  // Source already has shebang; esbuild preserves it as a comment.
  // We'll ensure exactly one shebang after build.
  banner: { js: "#!/usr/bin/env node" },
  // Bundle everything except Node built-ins
  external: [
    "node:*",
    "fs", "path", "os", "util", "child_process", "url", "crypto",
    "stream", "events", "buffer", "readline", "tty", "net", "http", "https",
  ],
});

// Fix double-shebang: strip all shebangs then prepend one
const out = "dist/index.js";
let code = readFileSync(out, "utf-8");
code = code.replace(/^#!.*\n/gm, "");
writeFileSync(out, "#!/usr/bin/env node\n" + code);

console.log("✓ bundled dist/index.js");
