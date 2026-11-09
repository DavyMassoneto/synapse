import { type ModelCaller } from "../client"
import { type Settings } from "../settings"
import { type Source } from "../source"
import { type VERDICT_ATTENTION, type VERDICT_FAILURE, type VERDICT_OK } from "./constants"
import { type ReviewInput } from "./message"
import { type Finding } from "./model"

export type Verdict = typeof VERDICT_OK | typeof VERDICT_ATTENTION | typeof VERDICT_FAILURE

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
