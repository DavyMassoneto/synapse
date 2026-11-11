import {
  FUNCTION_TYPE,
  INCOMPLETE_TOOL_CALL,
  MISSING_FINISH,
  STOP_FINISH,
  TOOL_CALLS_FINISH,
  UNEXPECTED_FINISH,
  UNEXPECTED_FINISH_END,
} from "./constants"
import { type PendingToolCall, type StreamResult } from "./sse"
import { type ModelReply, type ToolCall } from "./types"

function toToolCall(call: PendingToolCall): ToolCall {
  if (call.id && call.name) {
    return { id: call.id, type: FUNCTION_TYPE, function: { name: call.name, arguments: call.arguments } }
  }
  throw new Error(INCOMPLETE_TOOL_CALL)
}

export function ensureCompleted(result: StreamResult): ModelReply {
  if (result.finishReason === STOP_FINISH || result.finishReason === TOOL_CALLS_FINISH) {
    return { content: result.content, toolCalls: Array.from(result.toolCalls.values(), toToolCall) }
  }
  if (result.finishReason) {
    throw new Error(`${UNEXPECTED_FINISH}${result.finishReason}${UNEXPECTED_FINISH_END}`)
  }
  throw new Error(MISSING_FINISH)
}
