import { spawnSync } from "node:child_process";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const directories = ["src/modules/advisor/tests", "tests/integration"];
const temporary = await mkdtemp(join(process.cwd(), ".typed-tests-"));
const outputs = [];

try {
  const manifest = JSON.parse(await readFile("package.json", "utf8"));
  const entrypoint = pathToFileURL(resolve(manifest.pi.extensions[0])).href;
  const fixture = join(temporary, "distribution-host.mjs");
  await build({
    entryPoints: ["tests/fixtures/distribution-host.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    alias: { "@/entry": entrypoint },
    external: [entrypoint],
    outfile: fixture,
  });

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
      outputs.push(output);
    }
  }

  const result = spawnSync(process.execPath, ["--test", ...outputs], {
    stdio: "inherit",
    env: { ...process.env, SYNAPSE_DISTRIBUTION_FIXTURE: fixture },
  });
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
