import { type Static } from "typebox"
import { type ReviewListSchema } from "./schemas"

export type ListedReview = Static<typeof ReviewListSchema>[number]

export interface Reviewed {
  kind: "reviewed"
}

export interface Unreviewed {
  kind: "unreviewed"
}

export type ReviewState = Reviewed | Unreviewed
