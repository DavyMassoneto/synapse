import { type ChatMessage, type ModelCaller } from "../client"
import { retry } from "../retry"
import { MAX_PARSE_ATTEMPTS } from "./constants"
import { fetchParsedReply } from "./fetch-parsed-reply"
import { isModelError } from "./predicates"
import { type ParsedReply } from "./types"

export function requestReply(caller: ModelCaller, messages: ChatMessage[], ruleIds: string[]): Promise<ParsedReply> {
  return retry(() => fetchParsedReply(caller, messages, ruleIds), {
    attempts: MAX_PARSE_ATTEMPTS,
    backoffMs: 0,
    isRetryable: isModelError,
  })
}
