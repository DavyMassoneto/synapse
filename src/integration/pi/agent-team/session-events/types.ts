import { type AgentSession } from "@earendil-works/pi-coding-agent"

export type TeamMemberSessionOperation =
  | "isStreaming"
  | "prompt"
  | "steer"
  | "abort"
  | "dispose"
  | "subscribe"
  | "getLastAssistantText"

export type TeamMemberSessionPort = Pick<AgentSession, TeamMemberSessionOperation>
