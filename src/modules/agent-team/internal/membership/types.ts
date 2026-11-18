import {
  type AgentTeam,
  type MemberTurnRuntime,
  type TeamClock,
  type TeamMemberRegistry,
} from "#synapse/modules/agent-team/public/contracts"
import { type TeamMember, type TeamMemberObserver } from "../member"
import { type MemberOutcome } from "../member-outcome"
import { type TeamRoster } from "../roster"
import { type AdmissionTaskObservation } from "../task-observation"

export type TeamGenerationValidation = () => void

export interface TeamRestoredAdmission {
  observer: TeamMembershipContext
  runtime: MemberTurnRuntime
  clock: TeamClock
  roster: TeamRoster
  validateGeneration: TeamGenerationValidation
}

export type TeamAdmissionJournal = Pick<TeamMemberRegistry, "recordAdmission">

export type TeamAdmissionObservation = AdmissionTaskObservation

export interface TeamAdmissionPersistencePorts {
  journal: TeamAdmissionJournal
  observation: TeamAdmissionObservation
}

export type TeamMembershipContext = AgentTeam & TeamMemberObserver

export type TeamAcquisitionCompletion = ReturnType<typeof Promise.withResolvers<MemberOutcome>>

export type TeamPendingAcquisitions = Set<TeamAcquisitionCompletion>

export type TeamAdmissionPersistence = "recorded" | "not-recorded" | "uncertain"

export interface TeamAdmissionAttempt {
  member?: TeamMember
  persistence?: TeamAdmissionPersistence
  outcome: MemberOutcome
}
