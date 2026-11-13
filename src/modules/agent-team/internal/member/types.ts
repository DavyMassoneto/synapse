import {
  type OpenedMember,
  type TeamAgentState,
  type TeamModelReference,
} from "#synapse/modules/agent-team/public/contracts"

export interface TeamMemberInterruptedOutcome {
  state: "interrupted"
}

export interface TeamMemberCompletedOutcome {
  state: TeamMemberCompletedState
  text: string
}

export type TeamMemberOutcome = TeamMemberInterruptedOutcome | TeamMemberCompletedOutcome

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
  effectiveModel: TeamModelReference
}

export type TeamActiveTools = Map<string, string>

export type TeamMemberFailureState = TeamMemberFailure | TeamMemberNoFailure

export interface TeamMemberFailure {
  kind: "failed"
  message: string
}

export interface TeamMemberNoFailure {
  kind: "none"
}

export type TeamMemberCompletedState = "finished" | "failed"
