import { type Static } from "typebox"
import { type ReviewListSchema } from "./constants"

export type ListedReview = Static<typeof ReviewListSchema>[number]

export interface ReviewWithBody extends ListedReview {
  body: string
}

export interface Reviewed {
  kind: "reviewed"
}

export interface Unreviewed {
  kind: "unreviewed"
}

export type ReviewState = Reviewed | Unreviewed
