import { AssertError, Value } from "typebox/value"
import { type ModelReply } from "#evaluator/provider-client"
import {
  APPROVE,
  INVALID_SUBMISSION,
  ISSUE_BREAK,
  MISSING_SUBMISSION,
  REQUEST_CHANGES,
  ReviewSubmissionSchema,
  SUBMIT_REVIEW,
} from "./constants"
import { type Finding, type ReviewResult, type ReviewVerdict } from "./types"

function failureDetail(error: Error): string {
  if (error instanceof AssertError) {
    return error.cause.errors.map((issue) => `${issue.instancePath} ${issue.message}`).join(ISSUE_BREAK)
  }
  return error.message
}

function submittedArguments(reply: ModelReply): string {
  const submission = reply.toolCalls.find((call) => call.function.name === SUBMIT_REVIEW)
  if (submission) {
    return submission.function.arguments
  }
  throw new Error(MISSING_SUBMISSION)
}

function verdictOf(findings: Finding[]): ReviewVerdict {
  if (findings.length > 0) {
    return REQUEST_CHANGES
  }
  return APPROVE
}

export function parseReviewResult(reply: ModelReply): ReviewResult {
  const submitted = submittedArguments(reply)
  try {
    const submission = Value.Parse(ReviewSubmissionSchema, JSON.parse(submitted))
    return { verdict: verdictOf(submission.findings), summary: submission.summary, findings: submission.findings }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`${INVALID_SUBMISSION}${failureDetail(error)}`, { cause: error })
    }
    throw error
  }
}
