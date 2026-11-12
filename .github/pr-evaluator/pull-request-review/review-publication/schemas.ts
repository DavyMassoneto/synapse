import { Type } from "typebox"

export const PublishedReviewSchema = Type.Object({ id: Type.Integer(), html_url: Type.String() })
