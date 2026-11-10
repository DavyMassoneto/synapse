import { type ReviewComment } from "#evaluator/pull-request-review"

export interface PreparedReview {
  body: string
  comments: ReviewComment[]
  unplacedCount: number
}
