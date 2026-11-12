import { TASK_PENDING, type TaskSnapshot, type TaskView } from "#synapse/modules/agent-team/public/contracts"
import { TASK_BOARD_OVERLAP_WARNING } from "./constants"
import { hasTaskBoardScopeOverlap, isTaskBoardRunning, isTaskBoardTaskReady } from "./predicates"
import { taskBoardCopySnapshot } from "./snapshot-copy"
import { taskBoardStatuses } from "./task-status"
import { type TaskBoardViewContext } from "./types"

export function taskBoardViewContext(tasks: TaskSnapshot[]): TaskBoardViewContext {
  return { statuses: taskBoardStatuses(tasks), running: tasks.filter(isTaskBoardRunning) }
}

export function taskBoardToTaskView(context: TaskBoardViewContext, task: TaskSnapshot): TaskView {
  const warnings: string[] = []
  for (const other of context.running) {
    if (other.id !== task.id && hasTaskBoardScopeOverlap(task.writeScopes, other.writeScopes)) {
      warnings.push(`${TASK_BOARD_OVERLAP_WARNING}${other.id}`)
    }
  }
  return {
    ...taskBoardCopySnapshot(task),
    ready: task.status === TASK_PENDING && isTaskBoardTaskReady(context.statuses, task),
    writeScopeWarnings: warnings,
  }
}
