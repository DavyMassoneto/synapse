import { type Static } from "typebox"
import { type Side } from "../diff"
import { type PublishedReviewSchema } from "./constants"

export interface ReviewComment {
  path: string
  line: number
  side: Side
  start_line?: number
  start_side?: Side
  body: string
}

export interface ReviewPayload {
  commit_id: string
  event: "COMMENT"
  body: string
  comments: ReviewComment[]
}

export type PublishedReview = Static<typeof PublishedReviewSchema>
