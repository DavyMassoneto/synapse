import { type ChatMessage } from "#evaluator/provider-client"
import { MAX_PROMPT_BYTES } from "#evaluator/review-request"
import {
  ARRAY_BRACKET_BALANCE_BYTES,
  CONVERSATION_TOO_LARGE,
  EMPTY_MESSAGES_BYTES,
  MESSAGE_SEPARATOR_BYTES,
} from "./constants"

export function ensureConversationLimit(bytes: number): void {
  if (bytes > MAX_PROMPT_BYTES) {
    throw new Error(`${CONVERSATION_TOO_LARGE}${bytes}/${MAX_PROMPT_BYTES}`)
  }
}

export function reviewMessagesBytes(messages: ChatMessage[]): number {
  let bytes = 0
  for (const message of messages) {
    bytes += Buffer.byteLength(JSON.stringify(message)) + MESSAGE_SEPARATOR_BYTES
  }
  if (messages.length === 0) {
    return EMPTY_MESSAGES_BYTES
  }
  return bytes + ARRAY_BRACKET_BALANCE_BYTES
}
