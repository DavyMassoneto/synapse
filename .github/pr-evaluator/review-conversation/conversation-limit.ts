import { type ChatMessage, type ModelReply } from "#evaluator/provider-client"
import { CONVERSATION_TOO_LARGE, MAX_CONVERSATION_BYTES, MAX_ROUND_TOOL_CALLS, TOO_MANY_TOOL_CALLS } from "./constants"

export function ensureConversationLimit(messages: ChatMessage[]): void {
  const bytes = Buffer.byteLength(JSON.stringify(messages))
  if (bytes > MAX_CONVERSATION_BYTES) {
    throw new Error(`${CONVERSATION_TOO_LARGE}${bytes}/${MAX_CONVERSATION_BYTES}`)
  }
}

export function ensureRoundToolLimit(reply: ModelReply): void {
  if (reply.toolCalls.length > MAX_ROUND_TOOL_CALLS) {
    throw new Error(`${TOO_MANY_TOOL_CALLS}${reply.toolCalls.length}/${MAX_ROUND_TOOL_CALLS}`)
  }
}
