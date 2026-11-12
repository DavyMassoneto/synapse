import { type AgentSession } from "@earendil-works/pi-coding-agent"
import { type Static } from "typebox"
import { type ReviewResult, type ReviewSubmissionSchema } from "#evaluator/review-result"
import { type WorkerInputSchema } from "./constants"

export type WorkerInput = Static<typeof WorkerInputSchema>
export type ReviewSubmission = Static<typeof ReviewSubmissionSchema>
export interface ReadySession {
  kind: "submitted"
  value: AgentSession
}
export type SessionState = PendingReview | ReadySession
export interface PendingReview {
  kind: "pending"
}
export interface SubmittedReview {
  kind: "submitted"
  review: ReviewResult
}
export interface FailedReview {
  kind: "failed"
  message: string
}
export type ReviewState = PendingReview | SubmittedReview | FailedReview
