import { existsSync, writeFileSync } from "node:fs"
import { readJsonFile } from "../validated-json"
import { SCRIPTED_PROVIDER_SCRIPT_VARIABLE, SCRIPTED_PROVIDER_TRACK_OFFSET_SUFFIX } from "./constants"
import { requireEnvironment } from "./require-environment"
import { SCRIPTED_PROVIDER_TRACK_OFFSET_SCHEMA } from "./schemas"

export function advanceScriptTrack(track: number): number {
  const path = `${requireEnvironment(SCRIPTED_PROVIDER_SCRIPT_VARIABLE)}.${track}${SCRIPTED_PROVIDER_TRACK_OFFSET_SUFFIX}`
  let index = 0
  if (existsSync(path)) {
    index = readJsonFile(path, SCRIPTED_PROVIDER_TRACK_OFFSET_SCHEMA).index
  }
  writeFileSync(path, JSON.stringify({ index: index + 1 }))
  return index
}
