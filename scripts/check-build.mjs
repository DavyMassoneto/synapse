import { readFileSync } from "node:fs";
import { build } from "esbuild";
import { buildOptions } from "#build-options";

const result = await build({ ...buildOptions, write: false });
const generated = result.outputFiles[0].text;
const committed = readFileSync("dist/index.js", "utf8");
if (generated !== committed) {
  throw new Error("dist/index.js está desatualizado; execute npm run build");
}
