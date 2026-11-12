import {
  type CreateTaskInput,
  TASK_ACCEPTED,
  TASK_DELETED,
  TASK_PENDING,
  TASK_REFUSED,
  type TaskFilter,
  type TaskJournal,
  type TaskOutcome,
  type TaskSnapshot,
  type TaskView,
  type UpdateTaskInput,
} from "#synapse/modules/agent-team/public/contracts"
import { taskBoardResolveBlockers } from "./blockers"
import {
  TASK_BOARD_DELETED_MESSAGE,
  TASK_BOARD_FIRST_NUMBER,
  TASK_BOARD_INITIAL_REVISION,
  TASK_BOARD_MAX_DESCRIPTION_LENGTH,
  TASK_BOARD_MAX_SUBJECT_LENGTH,
  TASK_BOARD_MAX_TASKS,
  TASK_BOARD_STALE_REVISION,
  TASK_BOARD_UNKNOWN_TASK,
  TASK_ID_PREFIX,
  TASK_LIMIT,
} from "./constants"
import { isTaskBoardActive, isTaskBoardFilterMatch } from "./predicates"
import { taskBoardCopySnapshot } from "./snapshot-copy"
import { TaskRefusal } from "./task-refusal"
import { taskBoardRequireText } from "./task-text"
import { taskBoardToTaskView, taskBoardViewContext } from "./task-view"
import { taskBoardApplyAction } from "./transitions"
import { type TaskBoardAction, type TaskBoardRestorePositions, type TeamDirectory } from "./types"
import { taskBoardNormalizeScopes } from "./write-scope"

export class TaskBoard {
  private readonly journal: TaskJournal

  private readonly directory: TeamDirectory

  private tasks: TaskSnapshot[] = []

  private nextNumber = TASK_BOARD_FIRST_NUMBER

  constructor(journal: TaskJournal, directory: TeamDirectory) {
    this.journal = journal
    this.directory = directory
  }

  restore(snapshots: TaskSnapshot[]): void {
    this.tasks = []
    this.nextNumber = TASK_BOARD_FIRST_NUMBER
    const positions: TaskBoardRestorePositions = new Map()
    for (const snapshot of snapshots) {
      const slot = positions.get(snapshot.id)
      const copied = taskBoardCopySnapshot(snapshot)
      if (slot) {
        this.tasks[slot.index] = copied
      } else {
        positions.set(snapshot.id, { index: this.tasks.length })
        this.tasks.push(copied)
      }
      this.advance(snapshot)
    }
  }

  create(input: CreateTaskInput): TaskOutcome {
    return this.execute(this.createSnapshot.bind(this, input))
  }

  get(id: string): TaskOutcome {
    return this.execute(this.getSnapshot.bind(this, id))
  }

  private getSnapshot(id: string): TaskView {
    return taskBoardToTaskView(taskBoardViewContext(this.tasks), this.find(id))
  }

  list(filter: TaskFilter): TaskView[] {
    const views: TaskView[] = []
    const context = taskBoardViewContext(this.tasks)
    for (const task of this.tasks) {
      if (isTaskBoardActive(task)) {
        const view = taskBoardToTaskView(context, task)
        if (isTaskBoardFilterMatch(view, filter)) {
          views.push(view)
        }
      }
    }
    return views
  }

  update(caller: string, input: UpdateTaskInput): TaskOutcome {
    return this.execute(this.updateSnapshot.bind(this, caller, input))
  }

  private execute(action: TaskBoardAction): TaskOutcome {
    try {
      return { kind: TASK_ACCEPTED, task: action() }
    } catch (error) {
      if (error instanceof TaskRefusal) {
        return { kind: TASK_REFUSED, message: error.message }
      }
      throw error
    }
  }

  private hasTaskLimit(): boolean {
    let count = 0
    for (const task of this.tasks) {
      if (isTaskBoardActive(task)) {
        count += 1
      }
      if (count >= TASK_BOARD_MAX_TASKS) {
        return true
      }
    }
    return false
  }

  private createSnapshot(input: CreateTaskInput): TaskView {
    if (this.hasTaskLimit()) {
      throw new TaskRefusal(`${TASK_LIMIT}${TASK_BOARD_MAX_TASKS}`)
    }
    const id = `${TASK_ID_PREFIX}${this.nextNumber}`
    return this.commit({
      id,
      revision: TASK_BOARD_INITIAL_REVISION,
      subject: taskBoardRequireText(input.subject, TASK_BOARD_MAX_SUBJECT_LENGTH),
      description: taskBoardRequireText(input.description, TASK_BOARD_MAX_DESCRIPTION_LENGTH),
      status: TASK_PENDING,
      blockedBy: taskBoardResolveBlockers(this.tasks, input.blockedBy, id),
      writeScopes: taskBoardNormalizeScopes(input.writeScopes),
    })
  }

  private updateSnapshot(caller: string, input: UpdateTaskInput): TaskView {
    const current = this.find(input.taskId)
    if (current.revision !== input.expectedRevision) {
      throw new TaskRefusal(`${TASK_BOARD_STALE_REVISION}${current.revision}`)
    }
    if (current.status === TASK_DELETED) {
      throw new TaskRefusal(TASK_BOARD_DELETED_MESSAGE)
    }
    const next = taskBoardApplyAction({ current, tasks: this.tasks, input, caller, directory: this.directory })
    return this.commit({ ...next, revision: current.revision + 1 })
  }

  private commit(task: TaskSnapshot): TaskView {
    this.journal.recordTask(taskBoardCopySnapshot(task))
    this.storeAndAdvance(task)
    return taskBoardToTaskView(taskBoardViewContext(this.tasks), task)
  }

  private storeAndAdvance(task: TaskSnapshot): void {
    const index = this.tasks.findIndex((candidate) => candidate.id === task.id)
    const snapshot = taskBoardCopySnapshot(task)
    if (index >= 0) {
      this.tasks[index] = snapshot
    } else {
      this.tasks.push(snapshot)
    }
    this.advance(task)
  }

  private advance(task: TaskSnapshot): void {
    const number = Number(task.id.slice(TASK_ID_PREFIX.length))
    if (Number.isSafeInteger(number) && number >= this.nextNumber) {
      this.nextNumber = number + 1
    }
  }

  private find(id: string): TaskSnapshot {
    const task = this.tasks.find((candidate) => candidate.id === id)
    if (task) {
      return task
    }
    throw new TaskRefusal(`${TASK_BOARD_UNKNOWN_TASK}${id}`)
  }
}
