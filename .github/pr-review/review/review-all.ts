import { splitChunks } from "../chunks"
import { mapWithLimit } from "../concurrency"
import { buildNotes } from "./build-notes"
import { buildUserMessage } from "./build-user-message"
import { CHUNK_CONCURRENCY } from "./constants"
import { decideVerdict } from "./decide-verdict"
import { excludeKnown } from "./exclude-known"
import { reviewPart } from "./review-part"
import { type ChunkOutcome, type ReviewRequest, type ReviewResult } from "./types"

export async function reviewAll(request: ReviewRequest): Promise<ReviewResult> {
  const split = splitChunks(request.sources)
  const parts = split.chunks.map((chunk, index) => ({ chunk, position: index + 1 }))
  const outcomes: ChunkOutcome[] = await mapWithLimit(parts, CHUNK_CONCURRENCY, (part) => {
    const message = buildUserMessage(request.settings, request.input, part.chunk, part.position, parts.length)
    return reviewPart(request.caller, request.systemPrompt, message, request.ruleIds)
  })
  const findings = excludeKnown(
    outcomes.flatMap((outcome) => outcome.findings),
    [],
  )
  const notes = buildNotes(outcomes, split.skipped, request.sources)
  return { verdict: decideVerdict(findings, notes), findings, notes }
}
