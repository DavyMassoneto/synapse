import {
  type AgentTeam,
  type TaskJournal,
  type TaskSelection,
  type TeamAgentRow,
  type TeamMemberRegistry,
} from "#synapse/modules/agent-team/public/contracts"

import { type ObservedTime } from "../run-observation"

export type ObservedTaskJournal = TaskJournal & Pick<TeamMemberRegistry, "recordAdmission">

export type ObservedTaskTimes = Map<string, ObservedTime>

export interface ObservedAgentTasks {
  row: TeamAgentRow
  selection: TaskSelection
}

export type ObservedAgentRows = Map<string, ObservedAgentTasks>

export type TaskSelectionReader = Pick<AgentTeam, "selectedTask">
