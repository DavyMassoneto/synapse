import { AssertError, Value } from "typebox/value"
import { APPROVE, INVALID_SUBMISSION, ISSUE_BREAK, REQUEST_CHANGES, ReviewSubmissionSchema } from "./constants"
import { type Finding, type ReviewResult, type ReviewVerdict, type SubmissionIssue } from "./types"

function failureDetail(error: Error): string {
  if (error instanceof AssertError) {
    return error.cause.errors.map(submissionIssue).join(ISSUE_BREAK)
  }
  return error.message
}

function submissionIssue(issue: SubmissionIssue): string {
  return `${issue.instancePath} ${issue.message}`
}

function verdictOf(findings: Finding[]): ReviewVerdict {
  if (findings.length > 0) {
    return REQUEST_CHANGES
  }
  return APPROVE
}

export function parseReviewResult(text: string): ReviewResult {
  try {
    const submission = Value.Parse(ReviewSubmissionSchema, JSON.parse(text))
    return { verdict: verdictOf(submission.findings), summary: submission.summary, findings: submission.findings }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`${INVALID_SUBMISSION}${failureDetail(error)}`)
    }
    throw error
  }
}
