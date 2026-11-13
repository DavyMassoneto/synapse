import { type Static } from "typebox"
import { type FindingSchema } from "./schemas"

export type Finding = Static<typeof FindingSchema>

export type ReviewVerdict = "approve" | "request_changes"

export interface ReviewResult {
  verdict: ReviewVerdict
  summary: string
  findings: Finding[]
}
