import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { vi } from "vitest"
import { PI_REQUEST_LOG_VARIABLE } from "../request-log"
import {
  SCRIPTED_PROVIDER_MODEL,
  SCRIPTED_PROVIDER_MODEL_VARIABLE,
  SCRIPTED_PROVIDER_PROVIDER,
  SCRIPTED_PROVIDER_PROVIDER_VARIABLE,
  SCRIPTED_PROVIDER_SCRIPT_VARIABLE,
} from "../scripted-provider"
import {
  SELECTION_AGENT_ENVIRONMENT,
  SELECTION_CONFIG,
  SELECTION_DISABLE_EXTENSION_PREFIX,
  SELECTION_EXCLUDED_EXTENSION_URL,
  SELECTION_EXTERNAL_EXTENSION_URL,
  SELECTION_LEAD_STEPS,
  SELECTION_LOG,
  SELECTION_MEMBER_MARKER,
  SELECTION_MEMBER_STEPS,
  SELECTION_PROVIDER_URL,
  SELECTION_SCRIPT,
  SELECTION_SETTINGS,
} from "./constants"
import { type SelectionPaths } from "./types"

export function prepareSelectionDirectories(paths: SelectionPaths): void {
  mkdirSync(paths.agentDirectory)
  mkdirSync(paths.cwd)
  writeFileSync(join(paths.cwd, SELECTION_SETTINGS), JSON.stringify({ fixture: true }))
}

export function prepareSelectionExtensions(paths: SelectionPaths): void {
  const excluded = fileURLToPath(SELECTION_EXCLUDED_EXTENSION_URL)
  writeFileSync(join(paths.agentDirectory, SELECTION_CONFIG), JSON.stringify({ excludedMemberExtensions: [excluded] }))
  writeFileSync(
    join(paths.agentDirectory, SELECTION_SETTINGS),
    JSON.stringify({
      extensions: [fileURLToPath(SELECTION_PROVIDER_URL), fileURLToPath(SELECTION_EXTERNAL_EXTENSION_URL), excluded],
      defaultProvider: SCRIPTED_PROVIDER_PROVIDER,
      defaultModel: SCRIPTED_PROVIDER_MODEL,
    }),
  )
}

export function disableSelectionExternal(paths: SelectionPaths): void {
  const external = fileURLToPath(SELECTION_EXTERNAL_EXTENSION_URL)
  writeFileSync(
    join(paths.agentDirectory, SELECTION_SETTINGS),
    JSON.stringify({
      extensions: [fileURLToPath(SELECTION_PROVIDER_URL), external, `${SELECTION_DISABLE_EXTENSION_PREFIX}${external}`],
      defaultProvider: SCRIPTED_PROVIDER_PROVIDER,
      defaultModel: SCRIPTED_PROVIDER_MODEL,
    }),
  )
}

export function prepareSelectionScript(paths: SelectionPaths): void {
  writeFileSync(
    join(paths.directory, SELECTION_SCRIPT),
    JSON.stringify({
      tracks: [{ marker: SELECTION_MEMBER_MARKER, steps: SELECTION_MEMBER_STEPS }, { steps: SELECTION_LEAD_STEPS }],
    }),
  )
}

export function prepareSelectionEnvironment(paths: SelectionPaths): void {
  vi.stubEnv(SELECTION_AGENT_ENVIRONMENT, paths.agentDirectory)
  vi.stubEnv(SCRIPTED_PROVIDER_SCRIPT_VARIABLE, join(paths.directory, SELECTION_SCRIPT))
  vi.stubEnv(SCRIPTED_PROVIDER_PROVIDER_VARIABLE, SCRIPTED_PROVIDER_PROVIDER)
  vi.stubEnv(SCRIPTED_PROVIDER_MODEL_VARIABLE, SCRIPTED_PROVIDER_MODEL)
  vi.stubEnv(PI_REQUEST_LOG_VARIABLE, join(paths.directory, SELECTION_LOG))
}
