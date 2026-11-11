import { type ChatMessage, type ModelReply } from "#evaluator/provider-client"
import { MAX_PROMPT_BYTES } from "#evaluator/review-request"
import { CONVERSATION_TOO_LARGE, MAX_ROUND_TOOL_CALLS, MESSAGE_SEPARATOR_BYTES, TOO_MANY_TOOL_CALLS } from "./constants"

export function ensureConversationLimit(bytes: number): void {
  if (bytes > MAX_PROMPT_BYTES) {
    throw new Error(`${CONVERSATION_TOO_LARGE}${bytes}/${MAX_PROMPT_BYTES}`)
  }
}

export function ensureRoundToolLimit(reply: ModelReply): void {
  if (reply.toolCalls.length > MAX_ROUND_TOOL_CALLS) {
    throw new Error(`${TOO_MANY_TOOL_CALLS}${reply.toolCalls.length}/${MAX_ROUND_TOOL_CALLS}`)
  }
}

export function reviewMessagesBytes(messages: ChatMessage[]): number {
  let bytes = 0
  for (const message of messages) {
    bytes += Buffer.byteLength(JSON.stringify(message)) + MESSAGE_SEPARATOR_BYTES
  }
  return bytes
}
