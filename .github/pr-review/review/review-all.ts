import { splitChunks } from "../chunks"
import { mapWithLimit } from "../concurrency"
import { buildNotes } from "./build-notes"
import { CHUNK_CONCURRENCY } from "./constants"
import { decideVerdict } from "./decide-verdict"
import { buildUserMessage } from "./message"
import { type ChunkOutcome, excludeKnown, reviewChunk } from "./rounds"
import { type ReviewRequest, type ReviewResult } from "./types"

export async function reviewAll(request: ReviewRequest): Promise<ReviewResult> {
  const split = splitChunks(request.sources)
  const positionedChunks = split.chunks.map((chunk, index) => ({ sources: chunk, position: index + 1 }))
  const outcomes: ChunkOutcome[] = await mapWithLimit(positionedChunks, CHUNK_CONCURRENCY, (chunk) => {
    const message = buildUserMessage(
      request.settings,
      request.input,
      chunk.sources,
      chunk.position,
      positionedChunks.length,
    )
    return reviewChunk(request.caller, request.systemPrompt, message, request.ruleIds)
  })
  const findings = excludeKnown(
    outcomes.flatMap((outcome) => outcome.findings),
    [],
  )
  const notes = buildNotes(outcomes, split.skipped, request.sources)
  return { verdict: decideVerdict(findings, notes), findings, notes }
}
