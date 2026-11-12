import {
  TASK_COMPLETED,
  TASK_DELETED,
  TASK_IN_PROGRESS,
  type TaskFilter,
  type TaskSnapshot,
  type TaskView,
} from "#synapse/modules/agent-team/public/contracts"
import { TASK_BOARD_SCOPE_SEPARATOR } from "./constants"
import { type TaskBoardStatusIndex } from "./types"

export function isTaskBoardActive(task: TaskSnapshot): boolean {
  return task.status !== TASK_DELETED
}

export function isTaskBoardTaskReady(statuses: TaskBoardStatusIndex, task: TaskSnapshot): boolean {
  return task.blockedBy.every((id) => statuses.get(id) === TASK_COMPLETED)
}

function isScopeOverlap(left: string, right: string): boolean {
  return (
    left === right ||
    left.startsWith(`${right}${TASK_BOARD_SCOPE_SEPARATOR}`) ||
    right.startsWith(`${left}${TASK_BOARD_SCOPE_SEPARATOR}`)
  )
}

export function hasTaskBoardScopeOverlap(left: string[], right: string[]): boolean {
  return left.some((scope) => right.some((other) => isScopeOverlap(scope, other)))
}

function isOwnershipMatch(task: TaskView, filter: TaskFilter): boolean {
  if (filter.owner && task.owner !== filter.owner) {
    return false
  }
  if (filter.unowned === true) {
    return !task.owner
  }
  if (filter.unowned === false) {
    return Boolean(task.owner)
  }
  return true
}

export function isTaskBoardFilterMatch(task: TaskView, filter: TaskFilter): boolean {
  if (filter.status && task.status !== filter.status) {
    return false
  }
  if ((filter.ready === true || filter.ready === false) && task.ready !== filter.ready) {
    return false
  }
  return isOwnershipMatch(task, filter)
}

export function isTaskBoardRunning(task: TaskSnapshot): boolean {
  return task.status === TASK_IN_PROGRESS
}
