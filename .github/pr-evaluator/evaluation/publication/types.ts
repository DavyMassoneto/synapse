import { type ReviewPayload } from "#evaluator/pull-request-review"

export interface PreparedReview {
  payload: ReviewPayload
  unplacedCount: number
}
