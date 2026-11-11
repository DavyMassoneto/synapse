import {
  FUNCTION_TYPE,
  INCOMPLETE_TOOL_CALL,
  MISSING_FINISH,
  STOP_FINISH,
  TOOL_CALLS_FINISH,
  UNEXPECTED_FINISH,
} from "./constants"
import { type PendingToolCall, type StreamResult } from "./sse"
import { type ModelReply, type ToolCall } from "./types"

function toToolCall(call: PendingToolCall): ToolCall {
  if (call.id && call.name) {
    return { id: call.id, type: FUNCTION_TYPE, function: { name: call.name, arguments: call.arguments } }
  }
  throw new Error(INCOMPLETE_TOOL_CALL)
}

export function toModelReply(result: StreamResult): ModelReply {
  if (result.finishReason === STOP_FINISH || result.finishReason === TOOL_CALLS_FINISH) {
    return {
      content: result.content,
      toolCalls: Array.from(result.toolCalls.values(), toToolCall),
      usage: result.usage,
      cache: result.cache,
    }
  }
  if (result.finishReason) {
    throw new Error(`${UNEXPECTED_FINISH}${result.finishReason}`)
  }
  throw new Error(MISSING_FINISH)
}
