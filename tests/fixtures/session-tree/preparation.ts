import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { vi } from "vitest"
import { SELECTION_SCRIPT, SELECTION_SETTINGS, type SelectionPaths } from "../task-selection"
import {
  TREE_HOME_DIRECTORY,
  TREE_HOME_ENV,
  TREE_PROBE_FILE,
  TREE_SCRIPT,
  TREE_SETTINGS,
  TREE_XDG_CACHE_DIRECTORY,
  TREE_XDG_CACHE_ENV,
  TREE_XDG_CONFIG_DIRECTORY,
  TREE_XDG_CONFIG_ENV,
  TREE_XDG_DATA_DIRECTORY,
  TREE_XDG_DATA_ENV,
} from "./constants"
import { TREE_PROBE_VARIABLE } from "./probe"

export function prepareTreeEnvironment(paths: SelectionPaths): void {
  const home = join(paths.directory, TREE_HOME_DIRECTORY)
  const config = join(home, TREE_XDG_CONFIG_DIRECTORY)
  const cache = join(home, TREE_XDG_CACHE_DIRECTORY)
  const data = join(home, TREE_XDG_DATA_DIRECTORY)
  mkdirSync(home)
  mkdirSync(config)
  mkdirSync(cache)
  mkdirSync(data)
  vi.stubEnv(TREE_HOME_ENV, home)
  vi.stubEnv(TREE_XDG_CONFIG_ENV, config)
  vi.stubEnv(TREE_XDG_CACHE_ENV, cache)
  vi.stubEnv(TREE_XDG_DATA_ENV, data)
  vi.stubEnv(TREE_PROBE_VARIABLE, join(paths.directory, TREE_PROBE_FILE))
}

export function prepareTreeSettings(paths: SelectionPaths): void {
  writeFileSync(join(paths.agentDirectory, SELECTION_SETTINGS), JSON.stringify(TREE_SETTINGS))
}

export function prepareTreeScript(paths: SelectionPaths): void {
  writeFileSync(join(paths.directory, SELECTION_SCRIPT), JSON.stringify(TREE_SCRIPT))
}
