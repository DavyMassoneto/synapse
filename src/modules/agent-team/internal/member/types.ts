import {
  type OpenedMember,
  type TEAM_FAILED,
  type TEAM_FINISHED,
  type TEAM_INTERRUPTED,
  type TeamAgentState,
  type TeamModelReference,
} from "#synapse/modules/agent-team/public/contracts"
import { type TEAM_MEMBER_HAS_FAILURE, type TEAM_MEMBER_NO_FAILURE } from "./constants"

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

export type TeamMemberTerminalState = typeof TEAM_FINISHED | typeof TEAM_FAILED | typeof TEAM_INTERRUPTED

export type TeamMemberFailureState = TeamMemberFailure | TeamMemberNoFailure

export interface TeamMemberFailure {
  kind: typeof TEAM_MEMBER_HAS_FAILURE
  message: string
}

export interface TeamMemberNoFailure {
  kind: typeof TEAM_MEMBER_NO_FAILURE
}

export interface TeamMemberPresentationPort {
  readonly effectiveModel: TeamModelReference
}
