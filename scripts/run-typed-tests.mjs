import { mkdtemp, readdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const directories = ["src/modules/advisor/tests", "tests/integration"];
const temporary = await mkdtemp(join(process.cwd(), ".typed-tests-"));

try {
  for (const directory of directories) {
    const files = await readdir(directory);
    for (const file of files) {
      if (!file.endsWith(".test.ts")) {
        continue;
      }
      const output = join(temporary, file.replace(".ts", ".mjs"));
      await build({
        entryPoints: [resolve(directory, file)],
        bundle: true,
        platform: "node",
        format: "esm",
        packages: "external",
        outfile: output,
      });
      await import(pathToFileURL(output).href);
    }
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
