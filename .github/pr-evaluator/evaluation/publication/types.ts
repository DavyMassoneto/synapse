import { type ReviewComment } from "#evaluator/pull-request-review"

export interface PreparedReview {
  body: string
  comments: ReviewComment[]
  unplacedCount: number
}

export interface ReconciledPublication {
  kind: "reconciled"
}

export interface AbsentPublication {
  kind: "absent"
}

export interface SupersededPublication {
  kind: "superseded"
  currentSha: string
}

export type PublicationObservation = ReconciledPublication | AbsentPublication | SupersededPublication
