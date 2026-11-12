import {
  type Api,
  type AssistantMessageEventStream,
  createAssistantMessageEventStream,
  type Model,
  type TranscriptContext,
} from "@earendil-works/pi-ai"
import { logRequest, PI_REQUEST_LOG_VARIABLE } from "../request-log"
import { PI_PROCESS_SCRIPT_FAILURE, PI_PROCESS_START_EVENT } from "./constants"
import { requireEnvironment } from "./require-environment"
import { advanceScriptTrack, selectScriptTrack } from "./script-track"
import { assistantMessage, emitStep } from "./stream-events"
import { type PiProcessScript, type PiProcessSelectedStep, type PiProcessTracks } from "./types"

export class ScriptedModelProvider {
  private readonly tracks: PiProcessTracks

  constructor(steps: PiProcessScript) {
    this.tracks = Array.isArray(steps) ? [{ steps }] : steps.tracks
  }

  private nextStep(context: TranscriptContext): PiProcessSelectedStep {
    const selected = selectScriptTrack(this.tracks, context)
    const track = this.tracks[selected]
    if (!track) {
      throw new Error(PI_PROCESS_SCRIPT_FAILURE)
    }
    const index = advanceScriptTrack(selected)
    const step = track.steps[index]
    if (!step) {
      throw new Error(PI_PROCESS_SCRIPT_FAILURE)
    }
    return { step, id: String(index + 1) }
  }

  stream(model: Model<Api>, context: TranscriptContext): AssistantMessageEventStream {
    logRequest(requireEnvironment(PI_REQUEST_LOG_VARIABLE), context)
    const selected = this.nextStep(context)
    const stream = createAssistantMessageEventStream()
    const message = assistantMessage(model)
    stream.push({ type: PI_PROCESS_START_EVENT, partial: message })
    emitStep(stream, message, selected.step, selected.id)
    stream.end()
    return stream
  }
}
