import { type Static } from "typebox"
import { type CommentSchema } from "./schemas"

export type Comment = Static<typeof CommentSchema>

export interface ReviewComment {
  path: string
  line: number
  side: string
  body: string
}

export interface ReviewPayload {
  commit_id: string
  event: string
  comments: ReviewComment[]
}

export interface BodyPayload {
  body: string
}

export type ApiPayload = BodyPayload | ReviewPayload

export interface InlineComment {
  path: string
  line: number
  body: string
}
