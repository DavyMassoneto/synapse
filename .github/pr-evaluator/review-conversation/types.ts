import { type ChatMessage } from "#evaluator/provider-client"
import { type ReviewResult } from "#evaluator/review-result"

export interface SubmittedReviewRound {
  kind: "submitted"
  review: ReviewResult
}

export interface ContinuingReviewRound {
  kind: "continuing"
  mustSubmit: boolean
  messages: ChatMessage[]
}

export type ReviewRoundOutcome = SubmittedReviewRound | ContinuingReviewRound
