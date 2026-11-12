import {
  type Api,
  type AssistantMessage,
  type AssistantMessageEventStream,
  type Model,
  parseToolCallArguments,
  type ToolCall,
} from "@earendil-works/pi-ai"
import { TEST_USAGE } from "../context"
import {
  SCRIPTED_PROVIDER_ASSISTANT_ROLE,
  SCRIPTED_PROVIDER_DONE_EVENT,
  SCRIPTED_PROVIDER_PENDING_REASON,
  SCRIPTED_PROVIDER_STOP_REASON,
  SCRIPTED_PROVIDER_TEXT_CONTENT,
  SCRIPTED_PROVIDER_TEXT_DELTA_EVENT,
  SCRIPTED_PROVIDER_TEXT_END_EVENT,
  SCRIPTED_PROVIDER_TEXT_KIND,
  SCRIPTED_PROVIDER_TEXT_START_EVENT,
  SCRIPTED_PROVIDER_TOOL_CALL_KIND,
  SCRIPTED_PROVIDER_TOOL_DELTA_EVENT,
  SCRIPTED_PROVIDER_TOOL_END_EVENT,
  SCRIPTED_PROVIDER_TOOL_START_EVENT,
  SCRIPTED_PROVIDER_TOOL_USE_REASON,
} from "./constants"
import { type ScriptedProviderStep } from "./types"

export function assistantMessage(model: Model<Api>): AssistantMessage {
  return {
    role: SCRIPTED_PROVIDER_ASSISTANT_ROLE,
    api: model.api,
    provider: model.provider,
    model: model.id,
    timestamp: Date.now(),
    content: [],
    stopReason: SCRIPTED_PROVIDER_PENDING_REASON,
    usage: TEST_USAGE,
  }
}

export function emitText(stream: AssistantMessageEventStream, message: AssistantMessage, text: string): void {
  message.content = [{ type: SCRIPTED_PROVIDER_TEXT_CONTENT, text: "" }]
  stream.push({ type: SCRIPTED_PROVIDER_TEXT_START_EVENT, contentIndex: 0, partial: message })
  message.content = [{ type: SCRIPTED_PROVIDER_TEXT_CONTENT, text }]
  stream.push({ type: SCRIPTED_PROVIDER_TEXT_DELTA_EVENT, contentIndex: 0, delta: text, partial: message })
  stream.push({ type: SCRIPTED_PROVIDER_TEXT_END_EVENT, contentIndex: 0, content: text, partial: message })
  message.stopReason = SCRIPTED_PROVIDER_STOP_REASON
  stream.push({ type: SCRIPTED_PROVIDER_DONE_EVENT, reason: SCRIPTED_PROVIDER_STOP_REASON, message })
}

export function emitToolCall(
  stream: AssistantMessageEventStream,
  message: AssistantMessage,
  name: string,
  argumentsJson: string,
  id: string,
): void {
  const call: ToolCall = {
    type: SCRIPTED_PROVIDER_TOOL_CALL_KIND,
    id,
    name,
    ...parseToolCallArguments(argumentsJson),
  }
  message.content = [call]
  stream.push({ type: SCRIPTED_PROVIDER_TOOL_START_EVENT, contentIndex: 0, partial: message })
  stream.push({ type: SCRIPTED_PROVIDER_TOOL_DELTA_EVENT, contentIndex: 0, delta: argumentsJson, partial: message })
  stream.push({ type: SCRIPTED_PROVIDER_TOOL_END_EVENT, contentIndex: 0, toolCall: call, partial: message })
  message.stopReason = SCRIPTED_PROVIDER_TOOL_USE_REASON
  stream.push({ type: SCRIPTED_PROVIDER_DONE_EVENT, reason: SCRIPTED_PROVIDER_TOOL_USE_REASON, message })
}

export function emitStep(
  stream: AssistantMessageEventStream,
  message: AssistantMessage,
  step: ScriptedProviderStep,
  id: string,
): void {
  if (step.kind === SCRIPTED_PROVIDER_TEXT_KIND) {
    emitText(stream, message, step.text)
  } else {
    emitToolCall(stream, message, step.name, step.argumentsJson, id)
  }
}
