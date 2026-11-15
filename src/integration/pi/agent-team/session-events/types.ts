import { type AgentSession } from "@earendil-works/pi-coding-agent"

export type TeamMemberSessionOperation =
  | "isStreaming"
  | "prompt"
  | "steer"
  | "abort"
  | "subscribe"
  | "getLastAssistantText"

export type TeamMemberSessionPort = Pick<AgentSession, TeamMemberSessionOperation>

export interface MemberAbortSucceeded {
  kind: "succeeded"
}
export interface MemberAbortFailed {
  kind: "failed"
  error: Error
}
export type MemberAbortOutcome = MemberAbortSucceeded | MemberAbortFailed
