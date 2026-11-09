import { type ChatMessage, type ModelCaller } from "../client"
import { CONTINUE_MESSAGE, MAX_ROUNDS, ROLE_ASSISTANT, ROLE_SYSTEM, ROLE_USER } from "./constants"
import { excludeKnown } from "./exclude-known"
import { requestReply } from "./request-reply"
import { type ChunkOutcome, type Finding } from "./types"

export async function reviewChunk(
  caller: ModelCaller,
  systemPrompt: string,
  userMessage: string,
  ruleIds: string[],
): Promise<ChunkOutcome> {
  const messages: ChatMessage[] = [
    { role: ROLE_SYSTEM, content: systemPrompt },
    { role: ROLE_USER, content: userMessage },
  ]
  const found: Finding[] = []
  for (let round = 1; round <= MAX_ROUNDS; round += 1) {
    const parsed = await requestReply(caller, messages, ruleIds)
    const fresh = excludeKnown(parsed.reply.findings, found)
    if (fresh.length === 0) {
      return { findings: found, complete: true }
    }
    found.push(...fresh)
    messages.push({ role: ROLE_ASSISTANT, content: parsed.raw }, { role: ROLE_USER, content: CONTINUE_MESSAGE })
  }
  return { findings: found, complete: false }
}
