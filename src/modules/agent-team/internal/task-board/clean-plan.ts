import {
  TASK_COMPLETED,
  TASK_DELETED,
  TASK_IN_PROGRESS,
  TASK_PENDING,
  type TaskSnapshot,
} from "#synapse/modules/agent-team/public/contracts"

export function taskBoardCleanPlan(tasks: TaskSnapshot[]): TaskSnapshot[] {
  const completed = new Set<string>()
  for (const task of tasks) {
    if (task.status === TASK_COMPLETED) {
      completed.add(task.id)
    }
  }
  const updates: TaskSnapshot[] = []
  for (const task of tasks) {
    if (completed.has(task.id)) {
      updates.push({ ...task, status: TASK_DELETED, revision: task.revision + 1 })
      continue
    }
    if (task.status === TASK_PENDING || task.status === TASK_IN_PROGRESS) {
      appendUnblockedTask(updates, task, completed)
    }
  }
  return updates
}

function appendUnblockedTask(updates: TaskSnapshot[], task: TaskSnapshot, completed: Set<string>): void {
  const surviving = new Set(task.blockedBy)
  for (const id of completed) {
    surviving.delete(id)
  }
  const blockedBy = task.blockedBy.filter(surviving.has, surviving)
  if (blockedBy.length !== task.blockedBy.length) {
    updates.push({ ...task, blockedBy, revision: task.revision + 1 })
  }
}
