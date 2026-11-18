import {
  type MemberRecord,
  type MemberTurnRuntime,
  TASK_SELECTED,
  type TeamTaskObservation as TaskObservation,
  type TaskSnapshot,
  type TaskView,
  type TeamAgentRow,
  type TeamClock,
} from "#synapse/modules/agent-team/public/contracts"
import {
  type ObservedAgentRows,
  type ObservedTaskJournal,
  type ObservedTaskTimes,
  type TaskSelectionReader,
} from "./types"

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
    this.updates.set(taskId, { timestamp: this.clock(), monotonic: this.runtime.monotonic() })
  }

  recordAdmission(record: MemberRecord, task: TaskSnapshot): void {
    const taskId = task.id
    this.journal.recordAdmission(record, task)
    this.updates.set(taskId, { timestamp: this.clock(), monotonic: this.runtime.monotonic() })
  }

  recordTaskCleanup(tasks: TaskSnapshot[]): void {
    this.journal.recordTaskCleanup(tasks)
    const now = { timestamp: this.clock(), monotonic: this.runtime.monotonic() }
    for (const task of tasks) {
      this.updates.set(task.id, now)
    }
  }

  attach(agents: TeamAgentRow[], tasks: TaskView[], selection: TaskSelectionReader): void {
    const rows: ObservedAgentRows = new Map()
    for (const agent of agents) {
      agent.tasks = []
      rows.set(agent.name, { row: agent, selection: selection.selectedTask(agent.name) })
    }
    const now = this.runtime.monotonic()
    for (const task of tasks) {
      if (task.owner) {
        const agent = rows.get(task.owner)
        if (agent?.row.tasks) {
          const selected = agent.selection
          const observation: TaskObservation = {
            id: task.id,
            revision: task.revision,
            bound: selected.kind === TASK_SELECTED && selected.task.id === task.id,
          }
          const updated = this.updates.get(task.id)
          if (updated) {
            observation.updatedAt = updated.timestamp
            observation.ageMs = Math.max(0, now - updated.monotonic)
          }
          agent.row.tasks.push(observation)
        }
      }
    }
  }
}
