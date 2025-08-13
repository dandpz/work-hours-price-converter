import { build } from "esbuild";
import fs from "fs";
import path from "path";

const srcDir = "src";
const outDir = "dist";

// Clean dist directory
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true });
}
fs.mkdirSync(outDir, { recursive: true });

// General config
const buildOptions = {
  bundle: true,
  minify: process.env.NODE_ENV === "production",
  sourcemap: process.env.NODE_ENV !== "production",
  target: ["chrome109"],
  platform: "browser",
  format: "esm",
};

// entry points
const entries = {
  "background/background.js": path.join(srcDir, "background", "background.ts"),
  "content/content.js": path.join(srcDir, "content", "content.ts"),
  "popup/popup.js": path.join(srcDir, "popup", "popup.ts"),
  "manifest.json": path.join(srcDir, "manifest.json"),
};

// utility function to copy CSS and HTML files
function copyFolder(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFolder(srcPath, destPath);
    } else if (file.endsWith(".css") || file.endsWith(".html")) {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

Promise.all(
  Object.entries(entries).map(([outfile, infile]) =>
    build({
      entryPoints: [infile],
      outfile: path.join(outDir, outfile),
      ...buildOptions,
    })
  )
)
  .then(() => {
    console.log("TypeScript build completed!");
    // Copy CSS & HTML
    ["content", "popup", "options"].forEach((folder) => {
      copyFolder(path.join(srcDir, folder), path.join(outDir, folder));
    });
    console.log("CSS and HTML copied!");
  })
  .catch((err) => {
    console.error("Build failed:", err);
    process.exit(1);
  });
