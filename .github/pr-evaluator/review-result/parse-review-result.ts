import { AssertError, Value } from "typebox/value"
import { type ModelReply } from "#evaluator/provider-client"
import { INVALID_SUBMISSION, ISSUE_BREAK, MISSING_SUBMISSION, ReviewResultSchema } from "./constants"
import { isSubmission } from "./predicates"
import { type ReviewResult } from "./types"

function failureDetail(error: Error): string {
  if (error instanceof AssertError) {
    return error.cause.errors.map((issue) => `${issue.instancePath} ${issue.message}`).join(ISSUE_BREAK)
  }
  return error.message
}

function submittedArguments(reply: ModelReply): string {
  const submission = reply.toolCalls.find(isSubmission)
  if (submission) {
    return submission.function.arguments
  }
  throw new Error(MISSING_SUBMISSION)
}

export function parseReviewResult(reply: ModelReply): ReviewResult {
  const submitted = submittedArguments(reply)
  try {
    return Value.Parse(ReviewResultSchema, JSON.parse(submitted))
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`${INVALID_SUBMISSION}${failureDetail(error)}`, { cause: error })
    }
    throw error
  }
}
