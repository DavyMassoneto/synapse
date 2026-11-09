import { type ModelCaller } from "../client"
import { reviewChunk } from "./review-chunk"
import { type ChunkOutcome } from "./types"
import { verifyFindings } from "./verify-findings"

export async function reviewPart(
  caller: ModelCaller,
  systemPrompt: string,
  userMessage: string,
  ruleIds: string[],
): Promise<ChunkOutcome> {
  const outcome = await reviewChunk(caller, systemPrompt, userMessage, ruleIds)
  return { findings: await verifyFindings(caller, userMessage, outcome.findings), complete: outcome.complete }
}
