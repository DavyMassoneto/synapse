import { splitChunks } from "../chunks"
import { type ModelCaller } from "../client"
import { mapWithLimit } from "../concurrency"
import { LIST_SEPARATOR } from "../separators"
import { type Source } from "../source"
import { fillTemplate } from "../templates"
import {
  CHUNK_CONCURRENCY,
  NOTE_INCOMPLETE_FILES,
  NOTE_INCOMPLETE_PART,
  NOTE_SKIPPED,
  VERDICT_ATTENTION,
  VERDICT_OK,
} from "./constants"
import { buildUserMessage } from "./message"
import { type Finding } from "./model"
import { type ChunkOutcome, excludeKnown, MAX_ROUNDS, reviewChunk } from "./rounds"
import { type ReviewRequest, type ReviewResult, type Verdict } from "./types"
import { verifyFindings } from "./verify"

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

export async function reviewPart(
  caller: ModelCaller,
  systemPrompt: string,
  userMessage: string,
  ruleIds: string[],
): Promise<ChunkOutcome> {
  const outcome = await reviewChunk(caller, systemPrompt, userMessage, ruleIds)
  return { findings: await verifyFindings(caller, userMessage, outcome.findings), complete: outcome.complete }
}

export function buildNotes(outcomes: ChunkOutcome[], skipped: number, sources: Source[]): string[] {
  const notes: string[] = []
  outcomes.forEach((outcome, index) => {
    if (!outcome.complete) {
      notes.push(fillTemplate(NOTE_INCOMPLETE_PART, [String(index + 1), String(MAX_ROUNDS)]))
    }
  })
  if (skipped > 0) {
    notes.push(fillTemplate(NOTE_SKIPPED, [String(skipped)]))
  }
  const incomplete = sources.filter((source) => source.incomplete).map((source) => source.path)
  if (incomplete.length > 0) {
    notes.push(fillTemplate(NOTE_INCOMPLETE_FILES, [incomplete.join(LIST_SEPARATOR)]))
  }
  return notes
}

export function decideVerdict(findings: Finding[], notes: string[]): Verdict {
  if (findings.length === 0 && notes.length === 0) {
    return VERDICT_OK
  }
  return VERDICT_ATTENTION
}
