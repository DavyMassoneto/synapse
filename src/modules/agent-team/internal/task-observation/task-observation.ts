import {
  type MemberTurnRuntime,
  type TaskSnapshot,
  type TaskView,
  type TeamAgentRow,
  type TeamClock,
} from "#synapse/modules/agent-team/public/contracts"
import { type ObservedTime } from "../run-observation"
import { attachTaskListsAndIndexObservedAgents } from "./agent-index"
import { appendObservedTaskViews } from "./task-views"
import { type ObservedTaskJournal, type ObservedTaskTimes, type TaskSelectionReader } from "./types"

export class TeamTaskObservation implements ObservedTaskJournal {
  private readonly journal: ObservedTaskJournal

  private readonly updates: ObservedTaskTimes = new Map()

  private readonly clock: TeamClock

  private readonly runtime: MemberTurnRuntime

  private epoch = 0

  get generation(): number {
    return this.epoch
  }

  constructor(journal: ObservedTaskJournal, clock: TeamClock, runtime: MemberTurnRuntime) {
    this.journal = journal
    this.clock = clock
    this.runtime = runtime
  }

  clear(): void {
    this.epoch += 1
    this.updates.clear()
  }

  recordTask(task: TaskSnapshot): void {
    const generation = this.generation
    const taskId = task.id
    this.journal.recordTask(task)
    this.recordUpdates([taskId], generation)
  }

  observeAdmission(task: TaskSnapshot, generation: number): void {
    this.recordUpdates([task.id], generation)
  }

  recordTaskCleanup(tasks: TaskSnapshot[]): void {
    const generation = this.generation
    const ids: string[] = []
    for (const task of tasks) {
      ids.push(task.id)
    }
    this.journal.recordTaskCleanup(tasks)
    this.recordUpdates(ids, generation)
  }

  private recordUpdates(ids: string[], generation: number): void {
    if (generation === this.generation) {
      const timestamp = this.clock()
      if (generation === this.generation) {
        const monotonic = this.runtime.monotonic()
        if (generation === this.generation) {
          const now: ObservedTime = { timestamp, monotonic }
          for (const id of ids) {
            this.updates.set(id, now)
          }
        }
      }
    }
  }

  attach(agents: TeamAgentRow[], tasks: TaskView[], selection: TaskSelectionReader): void {
    const rows = attachTaskListsAndIndexObservedAgents(agents, selection)
    const now = this.runtime.monotonic()
    appendObservedTaskViews(rows, tasks, this.updates, now)
  }
}
