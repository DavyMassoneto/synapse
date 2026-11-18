import {
  type AgentTeam,
  type TaskJournal,
  type TaskSelection,
  type TaskSnapshot,
  type TeamTaskObservation,
} from "#synapse/modules/agent-team/public/contracts"

import { type ObservedTime } from "../run-observation"

export type ObservedTaskJournal = TaskJournal

export interface AdmissionTaskObservation {
  readonly generation: number
  observeAdmission(task: TaskSnapshot, generation: number): void
}

export type ObservedTaskTimes = Map<string, ObservedTime>

export interface ObservedAgentTasks {
  tasks: TeamTaskObservation[]
  selection: TaskSelection
}

export type ObservedAgentRows = Map<string, ObservedAgentTasks>

export type TaskSelectionReader = Pick<AgentTeam, "selectedTask">
