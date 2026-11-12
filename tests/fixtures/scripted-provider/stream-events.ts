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
  PI_PROCESS_ASSISTANT_ROLE,
  PI_PROCESS_DONE_EVENT,
  PI_PROCESS_PENDING_REASON,
  PI_PROCESS_STOP_REASON,
  PI_PROCESS_TEXT_CONTENT,
  PI_PROCESS_TEXT_DELTA_EVENT,
  PI_PROCESS_TEXT_END_EVENT,
  PI_PROCESS_TEXT_KIND,
  PI_PROCESS_TEXT_START_EVENT,
  PI_PROCESS_TOOL_CALL_KIND,
  PI_PROCESS_TOOL_DELTA_EVENT,
  PI_PROCESS_TOOL_END_EVENT,
  PI_PROCESS_TOOL_START_EVENT,
  PI_PROCESS_TOOL_USE_REASON,
} from "./constants"
import { type PiProcessStep } from "./types"

export function assistantMessage(model: Model<Api>): AssistantMessage {
  return {
    role: PI_PROCESS_ASSISTANT_ROLE,
    api: model.api,
    provider: model.provider,
    model: model.id,
    timestamp: Date.now(),
    content: [],
    stopReason: PI_PROCESS_PENDING_REASON,
    usage: TEST_USAGE,
  }
}

export function emitText(stream: AssistantMessageEventStream, message: AssistantMessage, text: string): void {
  message.content = [{ type: PI_PROCESS_TEXT_CONTENT, text: "" }]
  stream.push({ type: PI_PROCESS_TEXT_START_EVENT, contentIndex: 0, partial: message })
  message.content = [{ type: PI_PROCESS_TEXT_CONTENT, text }]
  stream.push({ type: PI_PROCESS_TEXT_DELTA_EVENT, contentIndex: 0, delta: text, partial: message })
  stream.push({ type: PI_PROCESS_TEXT_END_EVENT, contentIndex: 0, content: text, partial: message })
  message.stopReason = PI_PROCESS_STOP_REASON
  stream.push({ type: PI_PROCESS_DONE_EVENT, reason: PI_PROCESS_STOP_REASON, message })
}

export function emitToolCall(
  stream: AssistantMessageEventStream,
  message: AssistantMessage,
  name: string,
  argumentsJson: string,
  id: string,
): void {
  const call: ToolCall = {
    type: PI_PROCESS_TOOL_CALL_KIND,
    id,
    name,
    ...parseToolCallArguments(argumentsJson),
  }
  message.content = [call]
  stream.push({ type: PI_PROCESS_TOOL_START_EVENT, contentIndex: 0, partial: message })
  stream.push({ type: PI_PROCESS_TOOL_DELTA_EVENT, contentIndex: 0, delta: argumentsJson, partial: message })
  stream.push({ type: PI_PROCESS_TOOL_END_EVENT, contentIndex: 0, toolCall: call, partial: message })
  message.stopReason = PI_PROCESS_TOOL_USE_REASON
  stream.push({ type: PI_PROCESS_DONE_EVENT, reason: PI_PROCESS_TOOL_USE_REASON, message })
}

export function emitStep(
  stream: AssistantMessageEventStream,
  message: AssistantMessage,
  step: PiProcessStep,
  id: string,
): void {
  if (step.kind === PI_PROCESS_TEXT_KIND) {
    emitText(stream, message, step.text)
  } else {
    emitToolCall(stream, message, step.name, step.argumentsJson, id)
  }
}
