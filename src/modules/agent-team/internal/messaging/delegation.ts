import { type TaskJournal, type TaskView } from "#synapse/modules/agent-team/public/contracts"
import { TeamRuleError } from "../operation-results"
import { type TaskBoard, TaskRefusal, taskBoardCopySnapshot } from "../task-board"

export function commitTaskDelegation(
  board: TaskBoard,
  journal: TaskJournal,
  sender: string,
  target: string,
  taskId: string,
  expectedRevision: number,
): TaskView {
  try {
    const prepared = board.prepareDelegation(sender, target, taskId, expectedRevision)
    journal.recordTask(taskBoardCopySnapshot(prepared))
    return board.acceptAdmission(prepared)
  } catch (error) {
    if (error instanceof TaskRefusal) {
      throw new TeamRuleError(error.message)
    }
    throw error
  }
}
