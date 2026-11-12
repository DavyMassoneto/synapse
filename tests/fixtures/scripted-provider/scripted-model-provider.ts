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
import { assistantMessage, emitStep } from "./stream-events"
import { type PiProcessScript, type PiProcessStep } from "./types"

export class ScriptedModelProvider {
  private readonly steps: PiProcessScript

  private index = 0

  constructor(steps: PiProcessScript) {
    this.steps = steps
  }

  private nextStep(): PiProcessStep {
    const step = this.steps[this.index]
    this.index += 1
    if (!step) {
      throw new Error(PI_PROCESS_SCRIPT_FAILURE)
    }
    return step
  }

  stream(model: Model<Api>, context: TranscriptContext): AssistantMessageEventStream {
    logRequest(requireEnvironment(PI_REQUEST_LOG_VARIABLE), context)
    const step = this.nextStep()
    const stream = createAssistantMessageEventStream()
    const message = assistantMessage(model)
    stream.push({ type: PI_PROCESS_START_EVENT, partial: message })
    emitStep(stream, message, step, String(this.index))
    stream.end()
    return stream
  }
}
