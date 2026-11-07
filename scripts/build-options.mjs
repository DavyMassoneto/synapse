export const buildOptions = {
  entryPoints: [".build/entry.js"],
  alias: { "@": "./.build" },
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  outfile: "dist/index.js",
  banner: {
    js: "/* ARQUIVO AUTOGERADO — NÃO EDITE DIRETAMENTE. Altere src/ e execute npm run build. */",
  },
};
