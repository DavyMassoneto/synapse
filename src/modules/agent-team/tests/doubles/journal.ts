import { type TaskJournal, type TaskSnapshot } from "#synapse/modules/agent-team"

export class TaskTestJournal implements TaskJournal {
  snapshots: TaskSnapshot[] = []

  fail = false

  recordTask(task: TaskSnapshot): void {
    if (this.fail) {
      throw new Error("journal indisponível")
    }
    this.snapshots.push(task)
  }
}
