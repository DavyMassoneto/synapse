import { type Static } from "typebox"
import { type FindingSchema, type ReplySchema, type VerdictsSchema } from "./schemas"

export type Finding = Static<typeof FindingSchema>

export type Reply = Static<typeof ReplySchema>

export type Verdicts = Static<typeof VerdictsSchema>

export interface ParsedReply {
  reply: Reply
  raw: string
}
