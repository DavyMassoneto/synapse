import {
  TASK_COMPLETED,
  TASK_DELETED,
  TASK_IN_PROGRESS,
  TASK_PENDING,
  type TaskSnapshot,
} from "#synapse/modules/agent-team/public/contracts"
import { type TaskBoardCleanPlan } from "./types"

export function taskBoardCleanPlan(tasks: TaskSnapshot[]): TaskBoardCleanPlan {
  const completed = new Set<string>()
  for (const task of tasks) {
    if (task.status === TASK_COMPLETED) {
      completed.add(task.id)
    }
  }
  const updates: TaskSnapshot[] = []
  const count = completed.size
  if (count === 0) {
    return { updates, count }
  }
  for (const task of tasks) {
    if (completed.has(task.id)) {
      updates.push({ ...task, status: TASK_DELETED, revision: task.revision + 1 })
      continue
    }
    if ((task.status === TASK_PENDING || task.status === TASK_IN_PROGRESS) && task.blockedBy.length > 0) {
      appendUnblockedTask(updates, task, completed)
    }
  }
  return { updates, count }
}

function appendUnblockedTask(updates: TaskSnapshot[], task: TaskSnapshot, completed: Set<string>): void {
  let blockedBy = task.blockedBy
  for (const [index, id] of task.blockedBy.entries()) {
    if (completed.has(id)) {
      if (blockedBy === task.blockedBy) {
        blockedBy = task.blockedBy.slice(0, index)
        updates.push({ ...task, blockedBy, revision: task.revision + 1 })
      }
    } else if (blockedBy !== task.blockedBy) {
      blockedBy.push(id)
    }
  }
}
