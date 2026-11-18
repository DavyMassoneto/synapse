import { TASK_SELECTED, type TaskView, type TeamTaskObservation } from "#synapse/modules/agent-team/public/contracts"
import { type ObservedAgentRows, type ObservedTaskTimes } from "./types"

export function appendObservedTaskViews(
  rows: ObservedAgentRows,
  tasks: TaskView[],
  updates: ObservedTaskTimes,
  now: number,
): void {
  for (const task of tasks) {
    if (task.owner) {
      const agent = rows.get(task.owner)
      if (agent) {
        const selected = agent.selection
        const observation: TeamTaskObservation = {
          id: task.id,
          revision: task.revision,
          bound: selected.kind === TASK_SELECTED && selected.task.id === task.id,
        }
        const updated = updates.get(task.id)
        if (updated) {
          observation.updatedAt = updated.timestamp
          observation.ageMs = Math.max(0, now - updated.monotonic)
        }
        agent.tasks.push(observation)
      }
    }
  }
}
