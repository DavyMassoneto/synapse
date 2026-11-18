import {
  type OpenedMember,
  type TeamAgentState,
  type TeamModelReference,
  type TeamProgress,
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
  memberNotice(message: string): void
  memberSettled(name: string, outcome: TeamMemberOutcome): void
  memberStartFailed(name: string, message: string): void
  refresh(): void
}

export interface TeamMemberRowInput {
  opened: OpenedMember
  lastState: TeamAgentState
  busy: boolean
  unconfirmed: number
  progress: TeamProgress
  effectiveModel: TeamModelReference
}

export type TeamMemberFailureState = TeamMemberFailure | TeamMemberNoFailure

export interface TeamMemberFailure {
  kind: "failed"
  message: string
}

export interface TeamMemberNoFailure {
  kind: "none"
}

export type TeamMemberCompletedState = "finished" | "failed"

export type TeamMemberStopConfirmed = () => void

export interface TeamMemberStopPolicy {
  confirmed(): void
  unconfirmed(): void
  failed(error: Error): void
  notice: TeamMemberNotice
}

type TeamMemberNotice = (message: string) => void

export type TeamMemberStopRequest = "requested" | "failed"

export interface TeamMemberStopResultPort {
  isCurrentExecution(executionId: number): boolean
  finishStop(outcome: TeamMemberStopOutcome): void
}

export type TeamMemberStopOutcome = "confirmed" | "unconfirmed"

export interface TeamMemberStopMessages {
  confirmed: string
  unconfirmed: string
}

export type TeamMemberNotificationAction = () => void

export interface TeamQueuedMessage {
  text: string
}
