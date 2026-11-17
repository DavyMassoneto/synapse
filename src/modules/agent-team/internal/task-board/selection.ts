import {
  TASK_CLAIM,
  TASK_IN_PROGRESS,
  TASK_RESUME,
  TASK_SELECTED,
  TASK_UNSELECTED,
  type TaskSelection,
  type TaskSnapshot,
  type TaskView,
  type UpdateTaskInput,
} from "#synapse/modules/agent-team/public/contracts"
import { isTaskBoardTaskReady } from "./predicates"
import { taskBoardToTaskView, taskBoardViewContext } from "./task-view"
import { type TaskBoardSelection } from "./types"

export function taskBoardSelectedTask(
  tasks: TaskSnapshot[],
  selection: TaskBoardSelection,
  caller: string,
): TaskSelection {
  const id = selection.get(caller)
  if (!id) {
    return { kind: TASK_UNSELECTED }
  }
  const task = tasks.find((candidate) => candidate.id === id)
  if (!task || task.owner !== caller || task.status !== TASK_IN_PROGRESS) {
    return { kind: TASK_UNSELECTED }
  }
  const context = taskBoardViewContext(tasks)
  if (!isTaskBoardTaskReady(context.statuses, task)) {
    return { kind: TASK_UNSELECTED }
  }
  return { kind: TASK_SELECTED, task: taskBoardToTaskView(context, task) }
}

export function selectAcceptedTask(
  selection: TaskBoardSelection,
  caller: string,
  input: UpdateTaskInput,
  task: TaskView,
): void {
  if (input.action === TASK_CLAIM || input.action === TASK_RESUME) {
    selection.set(caller, task.id)
  }
}
