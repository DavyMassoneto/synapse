import { readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  DefaultResourceLoader,
  ExtensionRunner,
  ModelRuntime,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent"
import { Type } from "typebox"
import { Value } from "typebox/value"
import { TestUI } from "../context"
import { DistributionRegistry } from "./distribution-registry"
import { type DistributionResult } from "./distribution-result-types"

const manifestSchema = Type.Object({ pi: Type.Object({ extensions: Type.Tuple([Type.String()]) }) })

export async function runDistribution(home: string): Promise<DistributionResult> {
  const manifestPath = fileURLToPath(new URL("../../../package.json", import.meta.url))
  const manifest = Value.Parse(manifestSchema, JSON.parse(readFileSync(manifestPath, "utf8")))
  const [extension] = manifest.pi.extensions
  const entrypoint = resolve(fileURLToPath(new URL("../../..", import.meta.url)), extension)
  const agentDir = join(home, ".pi", "agent")
  const loader = new DefaultResourceLoader({
    cwd: home,
    agentDir,
    settingsManager: SettingsManager.inMemory(),
    noExtensions: true,
    additionalExtensionPaths: [entrypoint],
    noSkills: true,
    noPromptTemplates: true,
    noThemes: true,
    noContextFiles: true,
  })
  await loader.reload()
  const loaded = loader.getExtensions()
  if (loaded.errors.length || loaded.extensions.length !== 1) {
    throw new Error(JSON.stringify(loaded.errors))
  }
  const runtime = await ModelRuntime.create({
    authPath: join(agentDir, "auth.json"),
    modelsPath: null,
    modelsStorePath: join(agentDir, "models-store.json"),
    allowModelNetwork: false,
    refreshOnCreate: false,
  })
  const registry = new DistributionRegistry(runtime)
  const runner = new ExtensionRunner(loaded.extensions, loaded.runtime, home, SessionManager.inMemory(home), registry)
  try {
    const ui = new TestUI()
    runner.getUIContext().notify = ui.notify.bind(ui)
    const command = runner.getCommand("advisor")
    const tool = runner.getToolDefinition("advisor")
    if (command instanceof Object && tool instanceof Object) {
      await command.handler("", runner.createCommandContext())
      const result = await tool.execute("id", {}, undefined, undefined, runner.createToolContext("id", undefined))
      return { notices: ui.notices, lookups: registry.fake.calls, isError: result.isError === true }
    }
    throw new Error("comando ou ferramenta ausente")
  } finally {
    await runner.emit({ type: "session_shutdown", reason: "quit" })
    runner.invalidate()
  }
}
