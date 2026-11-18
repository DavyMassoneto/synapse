import { type TaskJournal, type TaskView } from "#synapse/modules/agent-team/public/contracts"
import { rethrowTeamOperationError } from "../operation-results"
import { type TaskBoard, taskBoardCopySnapshot } from "../task-board"

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
    if (error instanceof Error) {
      rethrowTeamOperationError(error)
    }
    throw error
  }
}
