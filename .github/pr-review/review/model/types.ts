import { type Static } from "typebox"
import { type FindingSchema, type ReplySchema } from "./schemas"

export type Finding = Static<typeof FindingSchema>

export type Reply = Static<typeof ReplySchema>

export interface ParsedReply {
  reply: Reply
  replyText: string
}
