import { type TaskSnapshot } from "#synapse/modules/agent-team/public/contracts"
import {
  TASK_BOARD_DEPENDENCY_CYCLE,
  TASK_BOARD_DUPLICATE_BLOCKER,
  TASK_BOARD_SELF_BLOCK,
  TASK_BOARD_UNKNOWN_BLOCKER,
} from "./constants"
import { isTaskBoardActive } from "./predicates"
import { TaskRefusal } from "./task-refusal"
import { type TaskBoardSnapshotIndex } from "./types"

export function taskBoardResolveBlockers(tasks: TaskSnapshot[], ids: string[], taskId: string): string[] {
  const activeIds = new Set<string>()
  for (const task of tasks) {
    if (isTaskBoardActive(task)) {
      activeIds.add(task.id)
    }
  }
  const resolved = new Set<string>()
  for (const id of ids) {
    if (id === taskId) {
      throw new TaskRefusal(TASK_BOARD_SELF_BLOCK)
    }
    if (resolved.has(id)) {
      throw new TaskRefusal(`${TASK_BOARD_DUPLICATE_BLOCKER}${id}`)
    }
    if (!activeIds.has(id)) {
      throw new TaskRefusal(`${TASK_BOARD_UNKNOWN_BLOCKER}${id}`)
    }
    resolved.add(id)
  }
  return [...resolved]
}

export function taskBoardEnsureAcyclic(tasks: TaskSnapshot[], taskId: string, blockers: string[]): void {
  const index: TaskBoardSnapshotIndex = new Map()
  for (const task of tasks) {
    index.set(task.id, task)
  }
  const visited = new Set<string>()
  for (const blocker of blockers) {
    visitBlockersUntilTarget(index, blocker, taskId, visited)
  }
}

function visitBlockersUntilTarget(
  tasks: TaskBoardSnapshotIndex,
  fromId: string,
  target: string,
  visited: Set<string>,
): void {
  const pending = [fromId]
  while (pending.length > 0) {
    const id = pending.pop()
    if (id && !visited.has(id)) {
      if (id === target) {
        throw new TaskRefusal(`${TASK_BOARD_DEPENDENCY_CYCLE}${fromId}`)
      }
      visited.add(id)
      const task = tasks.get(id)
      if (task) {
        pending.push(...task.blockedBy)
      }
    }
  }
}
