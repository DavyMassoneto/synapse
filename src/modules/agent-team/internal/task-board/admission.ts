import { TASK_IN_PROGRESS, TASK_PENDING, type TaskSnapshot } from "#synapse/modules/agent-team/public/contracts"
import { TASK_BOARD_NOT_READY, TASK_BOARD_STALE_REVISION, TASK_BOARD_UNAUTHORIZED } from "./constants"
import { isTaskBoardDelegationAuthorized, isTaskBoardTaskReady } from "./predicates"
import { taskBoardCopySnapshot } from "./snapshot-copy"
import { TaskRefusal } from "./task-refusal"
import { taskBoardStatuses } from "./task-status"

export function taskBoardPrepareDelegation(
  tasks: TaskSnapshot[],
  current: TaskSnapshot,
  caller: string,
  target: string,
  expectedRevision: number,
): TaskSnapshot {
  const prepared = taskBoardPrepareAdmission(tasks, current, target, expectedRevision)
  if (!isTaskBoardDelegationAuthorized(current, caller, target)) {
    throw new TaskRefusal(TASK_BOARD_UNAUTHORIZED)
  }
  return prepared
}

export function taskBoardValidateAdmission(
  tasks: TaskSnapshot[],
  current: TaskSnapshot,
  expectedRevision: number,
): void {
  if (current.revision !== expectedRevision) {
    throw new TaskRefusal(`${TASK_BOARD_STALE_REVISION}${current.revision}`)
  }
  if (
    (current.status !== TASK_PENDING && current.status !== TASK_IN_PROGRESS) ||
    !isTaskBoardTaskReady(taskBoardStatuses(tasks), current)
  ) {
    throw new TaskRefusal(TASK_BOARD_NOT_READY)
  }
}

export function taskBoardPrepareAdmission(
  tasks: TaskSnapshot[],
  current: TaskSnapshot,
  name: string,
  expectedRevision: number,
): TaskSnapshot {
  taskBoardValidateAdmission(tasks, current, expectedRevision)
  return taskBoardCopySnapshot({ ...current, owner: name, status: TASK_IN_PROGRESS, revision: current.revision + 1 })
}
