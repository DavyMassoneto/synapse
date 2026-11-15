import { Value } from "typebox/value"
import { type TaskSnapshot } from "#synapse/modules/agent-team"
import {
  TEAM_HISTORY_BOARD_CLEAN_ENTRY,
  TEAM_HISTORY_CUSTOM_ENTRY,
  TEAM_HISTORY_MEMBER_ENTRY,
  TEAM_HISTORY_TASK_ENTRY,
} from "./constants"
import { TeamHistoryBoardCleanSchema, TeamHistoryMemberSchema, TeamHistoryTaskSchema } from "./schemas"
import { type TeamHistory, type TeamHistorySessionManager, type TeamMembersByName } from "./types"

export function readTeamHistory(sessionManager: TeamHistorySessionManager, leadId: string): TeamHistory {
  const tasks: TaskSnapshot[] = []
  const members: TeamMembersByName = new Map()
  for (const entry of sessionManager.getBranch()) {
    if (entry.type !== TEAM_HISTORY_CUSTOM_ENTRY) {
      continue
    }
    if (entry.customType === TEAM_HISTORY_BOARD_CLEAN_ENTRY) {
      tasks.push(...Value.Parse(TeamHistoryBoardCleanSchema, entry.data).tasks)
    } else if (entry.customType === TEAM_HISTORY_TASK_ENTRY) {
      tasks.push(Value.Parse(TeamHistoryTaskSchema, entry.data))
    } else if (entry.customType === TEAM_HISTORY_MEMBER_ENTRY) {
      const record = Value.Parse(TeamHistoryMemberSchema, entry.data)
      if (record.leadId === leadId) {
        members.set(record.name, record)
      }
    }
  }
  return { tasks, members: Array.from(members.values()) }
}
