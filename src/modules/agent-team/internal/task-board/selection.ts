import {
  TASK_CLAIM,
  TASK_RESUME,
  type TaskView,
  type UpdateTaskInput,
} from "#synapse/modules/agent-team/public/contracts"
import { type TaskBoardSelection } from "./types"

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
