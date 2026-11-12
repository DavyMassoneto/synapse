import { type AgentToolResult } from "@earendil-works/pi-agent-core"
import { type AgentSession } from "@earendil-works/pi-coding-agent"
import { type Static } from "typebox"
import { type ModelConfiguration } from "#evaluator/configuration"
import { type PageRequest } from "#evaluator/output-page"
import { type InspectionRequest } from "#evaluator/repository-inspection"
import { type ReviewResult, type ReviewSubmissionSchema } from "#evaluator/review-result"

export interface WorkerInput {
  sha: string
  diff: string
  prompt: string
  model: ModelConfiguration
}
export type ReviewSubmission = Static<typeof ReviewSubmissionSchema>
export interface ReadySession {
  kind: "ready"
  value: AgentSession
}
export type SessionState = PendingReview | ReadySession
export interface PendingReview {
  kind: "pending"
}
export interface SubmittedReview {
  kind: "submitted"
  review: ReviewResult
}
export interface FailedReview {
  kind: "failed"
  message: string
}
export type ReviewState = PendingReview | SubmittedReview | FailedReview

export interface ReviewToolExecutors {
  inspect(id: string, request: InspectionRequest): Promise<AgentToolResult<string>>
  diff(id: string, request: PageRequest): Promise<AgentToolResult<string>>
  submit(id: string, submission: ReviewSubmission): Promise<AgentToolResult<string>>
}

export interface ReviewSettings {
  compaction: EnabledSetting
  retry: EnabledSetting
  enableSkillCommands: boolean
}
export interface EnabledSetting {
  enabled: boolean
}
export interface CacheHeaders {
  "Cache-Control": string
}
export interface ModelCost {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}
export interface WorkerEnvironment {
  PATH: NodeJS.ProcessEnv["PATH"]
  LANG: string
}
export type ModelInput = "text"[]
