import { type TranscriptContext } from "@earendil-works/pi-ai"
import {
  SCRIPTED_PROVIDER_PROVIDER_NEWLINE,
  SCRIPTED_PROVIDER_SYSTEM_ROLE,
  SCRIPTED_PROVIDER_TRACK_MISSING,
  SCRIPTED_PROVIDER_TRACK_SELECTED,
} from "./constants"
import { type ScriptedProviderTrackSelection, type ScriptedProviderTracks } from "./types"

export function selectScriptTrack(
  tracks: ScriptedProviderTracks,
  context: TranscriptContext,
): ScriptedProviderTrackSelection {
  const system = scriptSystemText(context)
  const selected = tracks.findIndex((track) => track.marker && system.includes(track.marker))
  if (selected >= 0) {
    return { kind: SCRIPTED_PROVIDER_TRACK_SELECTED, index: selected }
  }
  const unmarked = tracks.findIndex((track) => !track.marker)
  if (unmarked >= 0) {
    return { kind: SCRIPTED_PROVIDER_TRACK_SELECTED, index: unmarked }
  }
  return { kind: SCRIPTED_PROVIDER_TRACK_MISSING }
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
