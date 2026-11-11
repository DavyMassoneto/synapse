import { type ModelReply, type ToolMessage } from "#evaluator/provider-client"
import { type RepositorySnapshot, runInspectionTool } from "#evaluator/repository-inspection"
import { SUBMIT_REVIEW } from "#evaluator/review-result"
import { TOOL_ROLE } from "./constants"

export function executeReviewCalls(
  snapshot: RepositorySnapshot,
  reply: ModelReply,
  submissionError?: string,
): ToolMessage[] {
  const results: ToolMessage[] = []
  for (const call of reply.toolCalls) {
    let content: string
    if (submissionError && call.function.name === SUBMIT_REVIEW) {
      content = submissionError
    } else {
      content = runInspectionTool(snapshot, call)
    }
    results.push({ role: TOOL_ROLE, tool_call_id: call.id, content })
  }
  return results
}
