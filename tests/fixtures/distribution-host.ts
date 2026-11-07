import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import register from "#synapse-entry";
import { TestContext } from "./typed-context.ts";
import { AdvisorHostCollector } from "./typed-host.ts";

const manifest = JSON.parse(readFileSync("package.json", "utf8"));
const entrypoint = pathToFileURL(resolve(manifest.pi.extensions[0])).href;
assert.equal(entrypoint, import.meta.resolve("#synapse-entry"));
const host = new AdvisorHostCollector();
const context = new TestContext();
register(host);
assert.ok(host.command);
assert.ok(host.tool);
await host.command.handler("", context);
const result = await host.tool.execute("id", {}, undefined, undefined, context);
for (const notice of context.ui.notices) {
  process.stdout.write(`${notice}\n`);
}
process.stdout.write(`LOOKUPS=${context.modelRegistry.calls}\n`);
process.stdout.write(`ERROR=${String(result.isError === true)}\n`);
