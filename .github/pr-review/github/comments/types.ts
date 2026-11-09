import { type Static } from "typebox"
import { type CommentSchema } from "./schemas"

export type Comment = Static<typeof CommentSchema>
