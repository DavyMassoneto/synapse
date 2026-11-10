import { type Static } from "typebox"
import { type Side } from "#evaluator/diff-annotation"
import { type PublishedReviewSchema } from "./constants"

export interface ReviewComment {
  path: string
  line: number
  side: Side
  start_line?: number
  start_side?: Side
  body: string
}

export type PublishedReview = Static<typeof PublishedReviewSchema>
