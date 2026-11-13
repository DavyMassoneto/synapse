import { existsSync, writeFileSync } from "node:fs"
import { type TranscriptContext } from "@earendil-works/pi-ai"
import { readJsonFile } from "../validated-json"
import {
  SCRIPTED_PROVIDER_PROVIDER_NEWLINE,
  SCRIPTED_PROVIDER_SCRIPT_VARIABLE,
  SCRIPTED_PROVIDER_SYSTEM_ROLE,
  SCRIPTED_PROVIDER_TRACK_OFFSET_SUFFIX,
} from "./constants"
import { requireEnvironment } from "./require-environment"
import { SCRIPTED_PROVIDER_TRACK_OFFSET_SCHEMA } from "./schemas"
import { type ScriptedProviderTracks } from "./types"

export function selectScriptTrack(tracks: ScriptedProviderTracks, context: TranscriptContext): number {
  const system = scriptSystemText(context)
  const selected = tracks.findIndex((track) => track.marker && system.includes(track.marker))
  if (selected >= 0) {
    return selected
  }
  return tracks.findIndex((track) => !track.marker)
}

export function advanceScriptTrack(track: number): number {
  const path = `${requireEnvironment(SCRIPTED_PROVIDER_SCRIPT_VARIABLE)}.${track}${SCRIPTED_PROVIDER_TRACK_OFFSET_SUFFIX}`
  let index = 0
  if (existsSync(path)) {
    index = readJsonFile(path, SCRIPTED_PROVIDER_TRACK_OFFSET_SCHEMA).index
  }
  writeFileSync(path, JSON.stringify({ index: index + 1 }))
  return index
}

function scriptSystemText(context: TranscriptContext): string {
  let system = ""
  let separator = ""
  for (const message of context.messages) {
    if (message.role === SCRIPTED_PROVIDER_SYSTEM_ROLE) {
      system += separator + JSON.stringify(message)
      separator = SCRIPTED_PROVIDER_PROVIDER_NEWLINE
    }
  }
  return system
}
