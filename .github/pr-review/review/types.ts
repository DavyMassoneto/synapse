import { type Static } from "typebox"
import { type ModelCaller } from "../client"
import { type Settings } from "../settings"
import { type Source } from "../source"
import { type FindingSchema, type ReplySchema, type VerdictsSchema } from "./schemas"

export type Finding = Static<typeof FindingSchema>

export type Reply = Static<typeof ReplySchema>

export type Verdicts = Static<typeof VerdictsSchema>

export type Verdict = "OK" | "ATENÇÃO" | "FALHA"

export interface ParsedReply {
  reply: Reply
  raw: string
}

export interface ChunkOutcome {
  findings: Finding[]
  complete: boolean
}

export interface ReviewResult {
  verdict: Verdict
  findings: Finding[]
  notes: string[]
}

export interface ReviewRequest {
  caller: ModelCaller
  settings: Settings
  input: ReviewInput
  systemPrompt: string
  ruleIds: string[]
  sources: Source[]
}

export interface ReviewInput {
  treeListing: string
  deletedPaths: string[]
}
