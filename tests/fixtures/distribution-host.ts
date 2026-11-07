import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import {
  DefaultResourceLoader,
  ExtensionRunner,
  ModelRuntime,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";
import { DistributionRegistry } from "./distribution-registry.ts";
import { TestUI } from "./typed-context.ts";

const manifest = JSON.parse(readFileSync("package.json", "utf8"));
const entrypoint = resolve(manifest.pi.extensions[0]);
const cwd = homedir();
const agentDir = join(cwd, ".pi", "agent");
const loader = new DefaultResourceLoader({
  cwd,
  agentDir,
  settingsManager: SettingsManager.inMemory(),
  noExtensions: true,
  additionalExtensionPaths: [entrypoint],
  noSkills: true,
  noPromptTemplates: true,
  noThemes: true,
  noContextFiles: true,
});
await loader.reload();
const loaded = loader.getExtensions();
assert.deepEqual(loaded.errors, []);
assert.equal(loaded.extensions.length, 1);
const runtime = await ModelRuntime.create({
  authPath: join(agentDir, "auth.json"),
  modelsPath: null,
  modelsStorePath: join(agentDir, "models-store.json"),
  allowModelNetwork: false,
  refreshOnCreate: false,
});
const registry = new DistributionRegistry(runtime);
const runner = new ExtensionRunner(
  loaded.extensions,
  loaded.runtime,
  cwd,
  SessionManager.inMemory(cwd),
  registry,
);
const ui = new TestUI();
runner.getUIContext().notify = ui.notify.bind(ui);
const command = runner.getCommand("advisor");
const tool = runner.getToolDefinition("advisor");
assert.ok(command);
assert.ok(tool);
await command.handler("", runner.createCommandContext());
const result = await tool.execute(
  "id",
  {},
  undefined,
  undefined,
  runner.createToolContext("id", undefined),
);
for (const notice of ui.notices) {
  process.stdout.write(`${notice}\n`);
}
process.stdout.write(`LOOKUPS=${registry.fake.calls}\n`);
process.stdout.write(`ERROR=${String(result.isError === true)}\n`);
