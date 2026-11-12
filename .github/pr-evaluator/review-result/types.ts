import { type Static } from "typebox"
import { type APPROVE, type REQUEST_CHANGES } from "./constants"
import { type FindingSchema } from "./schemas"

export type Finding = Static<typeof FindingSchema>

export type ReviewVerdict = typeof APPROVE | typeof REQUEST_CHANGES

export interface ReviewResult {
  verdict: ReviewVerdict
  summary: string
  findings: Finding[]
}
