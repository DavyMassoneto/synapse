import {
  type Api,
  type AssistantMessageEventStream,
  createAssistantMessageEventStream,
  type Model,
  type TranscriptContext,
} from "@earendil-works/pi-ai"
import { logRequest, PI_REQUEST_LOG_VARIABLE } from "../request-log"
import {
  SCRIPTED_PROVIDER_SCRIPT_FAILURE,
  SCRIPTED_PROVIDER_START_EVENT,
  SCRIPTED_PROVIDER_TRACK_MISSING,
} from "./constants"
import { requireEnvironment } from "./require-environment"
import { selectScriptTrack } from "./script-track"
import { assistantMessage, emitStep } from "./stream-events"
import { advanceScriptTrack } from "./track-offset"
import { type ScriptedProviderScript, type ScriptedProviderSelectedStep, type ScriptedProviderTracks } from "./types"

export class ScriptedProvider {
  private readonly tracks: ScriptedProviderTracks

  constructor(steps: ScriptedProviderScript) {
    this.tracks = Array.isArray(steps) ? [{ steps }] : steps.tracks
  }

  private nextStep(context: TranscriptContext): ScriptedProviderSelectedStep {
    const selected = selectScriptTrack(this.tracks, context)
    if (selected.kind === SCRIPTED_PROVIDER_TRACK_MISSING) {
      throw new Error(SCRIPTED_PROVIDER_SCRIPT_FAILURE)
    }
    const track = this.tracks[selected.index]
    if (!track) {
      throw new Error(SCRIPTED_PROVIDER_SCRIPT_FAILURE)
    }
    const index = advanceScriptTrack(selected.index)
    const step = track.steps[index]
    if (!step) {
      throw new Error(SCRIPTED_PROVIDER_SCRIPT_FAILURE)
    }
    return { step, id: String(index + 1) }
  }

  stream(model: Model<Api>, context: TranscriptContext): AssistantMessageEventStream {
    logRequest(requireEnvironment(PI_REQUEST_LOG_VARIABLE), context)
    const selected = this.nextStep(context)
    const stream = createAssistantMessageEventStream()
    const message = assistantMessage(model)
    stream.push({ type: SCRIPTED_PROVIDER_START_EVENT, partial: message })
    emitStep(stream, message, selected.step, selected.id)
    stream.end()
    return stream
  }
}
