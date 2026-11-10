import { readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  DefaultResourceLoader,
  type LoadExtensionsResult,
  ModelRuntime,
  SettingsManager,
} from "@earendil-works/pi-coding-agent"
import { Value } from "typebox/value"
import { manifestSchema } from "./constants"
import { type DistributionEnvironment } from "./distribution-environment"

export function resolveEntrypoint(): string {
  const manifestPath = fileURLToPath(new URL("../../../package.json", import.meta.url))
  const manifest = Value.Parse(manifestSchema, JSON.parse(readFileSync(manifestPath, "utf8")))
  const [extension] = manifest.pi.extensions
  return resolve(fileURLToPath(new URL("../../..", import.meta.url)), extension)
}

export async function loadExtension(
  environment: DistributionEnvironment,
  entrypoint: string,
): Promise<LoadExtensionsResult> {
  const loader = new DefaultResourceLoader({
    cwd: environment.home,
    agentDir: environment.agentDirectory,
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
  return loaded
}

export function createRuntime(agentDirectory: string): Promise<ModelRuntime> {
  return ModelRuntime.create({
    authPath: join(agentDirectory, "auth.json"),
    modelsPath: null,
    modelsStorePath: join(agentDirectory, "models-store.json"),
    allowModelNetwork: false,
    refreshOnCreate: false,
  })
}
