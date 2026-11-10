import { Type } from "typebox"

export const REVIEW_EVENT = "COMMENT"

export const PublishedReviewSchema = Type.Object({ id: Type.Integer(), html_url: Type.String() })
