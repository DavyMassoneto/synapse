import { readFileSync } from "node:fs";
import { build } from "esbuild";

const result = await build({
  entryPoints: ["src/entry.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  write: false,
  outfile: "dist/index.js",
  banner: {
    js: "/* ARQUIVO AUTOGERADO — NÃO EDITE DIRETAMENTE. Altere src/ e execute npm run build. */",
  },
});

const generated = result.outputFiles[0].text;
const committed = readFileSync("dist/index.js", "utf8");
if (generated !== committed) {
  throw new Error("dist/index.js está desatualizado; execute npm run build");
}
