import { type ReviewPayload } from "#evaluator/pull-request-review"

export interface SkipEvaluation {
  kind: "skip"
  message: string
}

export interface ProceedEvaluation {
  kind: "proceed"
}

export type EvaluationDecision = SkipEvaluation | ProceedEvaluation

export type Proceed = () => Promise<void>

export interface PreparedReview {
  payload: ReviewPayload
  unplacedCount: number
}
