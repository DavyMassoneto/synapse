import { type ChatMessage, type ModelCaller } from "#synapse/client"
import { retry } from "#synapse/retry"
import { MAX_PARSE_ATTEMPTS } from "./constants"
import { parseReply, validateReply } from "./parse-reply"
import { isModelError } from "./predicates"
import { type ParsedReply } from "./types"

export function requestReply(caller: ModelCaller, messages: ChatMessage[], ruleIds: string[]): Promise<ParsedReply> {
  return retry(() => fetchParsedReply(caller, messages, ruleIds), {
    attempts: MAX_PARSE_ATTEMPTS,
    backoffMs: 0,
    isRetryable: isModelError,
  })
}

export async function fetchParsedReply(
  caller: ModelCaller,
  messages: ChatMessage[],
  ruleIds: string[],
): Promise<ParsedReply> {
  const replyText = await caller(messages)
  const reply = parseReply(replyText)
  validateReply(reply, ruleIds)
  return { reply, replyText }
}
