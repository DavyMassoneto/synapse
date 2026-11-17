import { type Api, createAssistantMessageEventStream, type Model, type TranscriptContext } from "@earendil-works/pi-ai"
import { logRequest, PI_REQUEST_LOG_VARIABLE } from "../request-log"
import {
  assistantMessage,
  emitText,
  requireEnvironment,
  SCRIPTED_PROVIDER_START_EVENT,
  ScriptedProvider,
  type ScriptedProviderScript,
} from "../scripted-provider"
import { SELECTION_NOTICE_REPLY } from "./constants"
import { isSelectionNoticeRequest } from "./predicates"

export class SelectionScriptedProvider {
  private readonly scripted: ScriptedProvider

  constructor(script: ScriptedProviderScript) {
    this.scripted = new ScriptedProvider(script)
  }

  stream(model: Model<Api>, context: TranscriptContext) {
    if (!isSelectionNoticeRequest(context)) {
      return this.scripted.stream(model, context)
    }
    logRequest(requireEnvironment(PI_REQUEST_LOG_VARIABLE), context)
    const stream = createAssistantMessageEventStream()
    const message = assistantMessage(model)
    stream.push({ type: SCRIPTED_PROVIDER_START_EVENT, partial: message })
    emitText(stream, message, SELECTION_NOTICE_REPLY)
    stream.end()
    return stream
  }
}
