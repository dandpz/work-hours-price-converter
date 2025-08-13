import { build } from "esbuild";
import { existsSync, rmSync, mkdirSync } from "fs";
import { join } from "path";

const srcDir = "src";
const outDir = "dist";

// Clean dist directory
if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true });
}
mkdirSync(outDir, { recursive: true });

// General config
const buildOptions = {
  bundle: true,
  minify: env.NODE_ENV === "production",
  sourcemap: true,
  target: ["chrome109"],
  outdir: outDir,
  platform: "browser",
  format: "esm",
};

// entry points
const entries = {
  "background.js": join(srcDir, "background.ts"),
  "content.js": join(srcDir, "content.ts"),
  "popup.js": join(srcDir, "popup.ts"),
  "options.js": join(srcDir, "options.ts")
};

Promise.all(
  Object.entries(entries).map(([outfile, infile]) =>
    build({ ...buildOptions, entryPoints: [infile], outfile })
  )
)
  .then(() => {
    console.log("Build completed!");
  })
  .catch((err) => {
    console.error("Build failed:", err);
    process.exit(1);
  });
