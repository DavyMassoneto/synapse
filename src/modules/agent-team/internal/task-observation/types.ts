import {
  type AgentTeam,
  type TaskJournal,
  type TaskSelection,
  type TeamAgentRow,
  type TeamMemberRegistry,
} from "#synapse/modules/agent-team/public/contracts"

export type ObservedTaskJournal = TaskJournal & Pick<TeamMemberRegistry, "recordAdmission">

export interface ObservedTaskTime {
  timestamp: string
  monotonic: number
}

export type ObservedTaskTimes = Map<string, ObservedTaskTime>

export interface ObservedAgentTasks {
  row: TeamAgentRow
  selection: TaskSelection
}

export type ObservedAgentRows = Map<string, ObservedAgentTasks>

export type TaskSelectionReader = Pick<AgentTeam, "selectedTask">
