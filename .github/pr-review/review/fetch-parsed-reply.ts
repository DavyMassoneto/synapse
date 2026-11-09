import { type ChatMessage, type ModelCaller } from "../client"
import { parseReply } from "./parse-reply"
import { type ParsedReply } from "./types"
import { validateReply } from "./validate-reply"

export async function fetchParsedReply(
  caller: ModelCaller,
  messages: ChatMessage[],
  ruleIds: string[],
): Promise<ParsedReply> {
  const raw = await caller(messages)
  const reply = parseReply(raw)
  validateReply(reply, ruleIds)
  return { reply, raw }
}
