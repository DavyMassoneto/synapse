import { type ModelCaller } from "../client"
import { type Settings } from "../settings"
import { type Source } from "../source"
import { type ReviewInput } from "./message"
import { type Finding } from "./model"

export type Verdict = "OK" | "ATENÇÃO" | "FALHA"

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
