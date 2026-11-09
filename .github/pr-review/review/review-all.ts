import { buildNotes } from "./build-notes"
import { decideVerdict } from "./decide-verdict"
import { buildUserMessage } from "./message"
import { reviewChunk } from "./rounds"
import { type ReviewRequest, type ReviewResult } from "./types"

export async function reviewAll(request: ReviewRequest): Promise<ReviewResult> {
  const outcome = await reviewChunk(
    request.caller,
    request.systemPrompt,
    buildUserMessage(request.settings, request.input, request.sources),
    request.ruleIds,
  )
  const findings = outcome.findings
  const notes = buildNotes(outcome, request.sources)
  return { verdict: decideVerdict(findings, notes), findings, notes }
}
