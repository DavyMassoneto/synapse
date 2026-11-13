import {
  type OpenedMember,
  type TeamAgentState,
  type TeamModelReference,
} from "#synapse/modules/agent-team/public/contracts"

export interface TeamMemberOutcome {
  state: TeamMemberTerminalState
  text: string
}

export interface TeamMemberObserver {
  memberSettled(name: string, outcome: TeamMemberOutcome): void
  memberStartFailed(name: string, message: string): void
  refresh(): void
}

export interface TeamMemberRowInput {
  opened: OpenedMember
  lastState: TeamAgentState
  busy: boolean
  waiting: boolean
  unconfirmed: number
  tools: TeamActiveTools
  presentation: TeamMemberPresentationPort
}

export type TeamActiveTools = Map<string, string>

export type TeamMemberTerminalState = "finished" | "failed" | "interrupted"

export type TeamMemberFailureState = TeamMemberFailure | TeamMemberNoFailure

export interface TeamMemberFailure {
  kind: "failed"
  message: string
}

export interface TeamMemberNoFailure {
  kind: "none"
}

export interface TeamMemberPresentationPort {
  readonly effectiveModel: TeamModelReference
}
