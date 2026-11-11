import { type ChatMessage, type ModelReply, type ToolMessage } from "#evaluator/provider-client"
import { type RepositorySnapshot } from "#evaluator/repository-inspection"
import { hasSubmission, parseReviewResult } from "#evaluator/review-result"
import { ASSISTANT_ROLE, CONTINUING_ROUND, SUBMITTED_ROUND } from "./constants"
import { executeReviewCalls } from "./execute-calls"
import { type ReviewRoundOutcome } from "./types"

function reviewReplyMessages(reply: ModelReply, results: ToolMessage[]): ChatMessage[] {
  if (reply.toolCalls.length === 0) {
    return [{ role: ASSISTANT_ROLE, content: reply.content }]
  }
  return [{ role: ASSISTANT_ROLE, content: reply.content, tool_calls: reply.toolCalls }, ...results]
}

function submittedRound(snapshot: RepositorySnapshot, reply: ModelReply): ReviewRoundOutcome {
  try {
    return { kind: SUBMITTED_ROUND, review: parseReviewResult(reply) }
  } catch (error) {
    if (error instanceof Error) {
      return {
        kind: CONTINUING_ROUND,
        mustSubmit: true,
        messages: reviewReplyMessages(reply, executeReviewCalls(snapshot, reply, error.message)),
      }
    }
    throw error
  }
}

export function handleReviewRound(snapshot: RepositorySnapshot, reply: ModelReply): ReviewRoundOutcome {
  if (hasSubmission(reply)) {
    return submittedRound(snapshot, reply)
  }
  return {
    kind: CONTINUING_ROUND,
    mustSubmit: reply.toolCalls.length === 0,
    messages: reviewReplyMessages(reply, executeReviewCalls(snapshot, reply)),
  }
}
