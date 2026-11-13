import { type TaskSnapshot } from "#synapse/modules/agent-team/public/contracts"
import { type TaskBoardStatusIndex } from "./types"

export function taskBoardStatuses(tasks: TaskSnapshot[]): TaskBoardStatusIndex {
  const statuses: TaskBoardStatusIndex = new Map()
  for (const task of tasks) {
    statuses.set(task.id, task.status)
  }
  return statuses
}
