import { type TeamAgentRow, type TeamTaskObservation } from "#synapse/modules/agent-team/public/contracts"
import { type ObservedAgentRows, type TaskSelectionReader } from "./types"

export function indexObservedAgentTasks(agents: TeamAgentRow[], selection: TaskSelectionReader): ObservedAgentRows {
  const rows: ObservedAgentRows = new Map()
  for (const agent of agents) {
    const tasks: TeamTaskObservation[] = []
    agent.tasks = tasks
    rows.set(agent.name, { tasks, selection: selection.selectedTask(agent.name) })
  }
  return rows
}
