import { type Static } from "typebox"
import { type APPROVE, type FindingSchema, type REQUEST_CHANGES } from "./constants"

export type Finding = Static<typeof FindingSchema>

export type ReviewVerdict = typeof APPROVE | typeof REQUEST_CHANGES

export interface ReviewResult {
  verdict: ReviewVerdict
  summary: string
  findings: Finding[]
}

export interface SubmissionIssue {
  instancePath: string
  message: string
}
