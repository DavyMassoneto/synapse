import {
  type MemberRecord,
  type MemberTurnRuntime,
  type TaskSnapshot,
  type TaskView,
  type TeamAgentRow,
  type TeamClock,
} from "#synapse/modules/agent-team/public/contracts"
import { captureObservedTime } from "../run-observation"
import { indexObservedAgentTasks } from "./agent-index"
import { appendObservedTaskViews } from "./task-views"
import { type ObservedTaskJournal, type ObservedTaskTimes, type TaskSelectionReader } from "./types"

export class TeamTaskObservation implements ObservedTaskJournal {
  private readonly journal: ObservedTaskJournal

  private readonly updates: ObservedTaskTimes = new Map()

  private readonly clock: TeamClock

  private readonly runtime: MemberTurnRuntime

  constructor(journal: ObservedTaskJournal, clock: TeamClock, runtime: MemberTurnRuntime) {
    this.journal = journal
    this.clock = clock
    this.runtime = runtime
  }

  clear(): void {
    this.updates.clear()
  }

  recordTask(task: TaskSnapshot): void {
    const taskId = task.id
    this.journal.recordTask(task)
    this.updates.set(taskId, captureObservedTime(this.clock, this.runtime))
  }

  recordAdmission(record: MemberRecord, task: TaskSnapshot): void {
    const taskId = task.id
    this.journal.recordAdmission(record, task)
    this.updates.set(taskId, captureObservedTime(this.clock, this.runtime))
  }

  recordTaskCleanup(tasks: TaskSnapshot[]): void {
    this.journal.recordTaskCleanup(tasks)
    const now = captureObservedTime(this.clock, this.runtime)
    for (const task of tasks) {
      this.updates.set(task.id, now)
    }
  }

  attach(agents: TeamAgentRow[], tasks: TaskView[], selection: TaskSelectionReader): void {
    const rows = indexObservedAgentTasks(agents, selection)
    const now = this.runtime.monotonic()
    appendObservedTaskViews(rows, tasks, this.updates, now)
  }
}
