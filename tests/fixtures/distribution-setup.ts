import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { type TestProject } from "vitest/node";

let temporary = "";

export async function setup(project: TestProject): Promise<void> {
  temporary = await mkdtemp(join(process.cwd(), ".typed-tests-"));
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
    project.provide("distributionFixture", fixture);
  } catch (error) {
    await rm(temporary, { recursive: true, force: true });
    throw error;
  }
}

export async function teardown(): Promise<void> {
  await rm(temporary, { recursive: true, force: true });
}
