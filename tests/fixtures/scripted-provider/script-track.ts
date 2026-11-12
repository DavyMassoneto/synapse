import { existsSync, writeFileSync } from "node:fs"
import { type TranscriptContext } from "@earendil-works/pi-ai"
import { readJsonFile } from "../validated-json"
import {
  PI_PROCESS_PROVIDER_NEWLINE,
  PI_PROCESS_SCRIPT_VARIABLE,
  PI_PROCESS_SYSTEM_ROLE,
  PI_PROCESS_TRACK_OFFSET_SCHEMA,
  PI_PROCESS_TRACK_OFFSET_SUFFIX,
} from "./constants"
import { requireEnvironment } from "./require-environment"
import { type PiProcessTracks } from "./types"

export function selectScriptTrack(tracks: PiProcessTracks, context: TranscriptContext): number {
  const system = scriptSystemText(context)
  const selected = tracks.findIndex((track) => track.marker && system.includes(track.marker))
  if (selected >= 0) {
    return selected
  }
  return tracks.findIndex((track) => !track.marker)
}

export function advanceScriptTrack(track: number): number {
  const path = `${requireEnvironment(PI_PROCESS_SCRIPT_VARIABLE)}.${track}${PI_PROCESS_TRACK_OFFSET_SUFFIX}`
  let index = 0
  if (existsSync(path)) {
    index = readJsonFile(path, PI_PROCESS_TRACK_OFFSET_SCHEMA).index
  }
  writeFileSync(path, JSON.stringify({ index: index + 1 }))
  return index
}

function scriptSystemText(context: TranscriptContext): string {
  let system = ""
  let separator = ""
  for (const message of context.messages) {
    if (message.role === PI_PROCESS_SYSTEM_ROLE) {
      system += separator + JSON.stringify(message)
      separator = PI_PROCESS_PROVIDER_NEWLINE
    }
  }
  return system
}
