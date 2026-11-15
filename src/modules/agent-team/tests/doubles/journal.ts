import { type TaskJournal, type TaskSnapshot } from "#synapse/modules/agent-team"
import { TEAM_TEST_JOURNAL_FAILURE, TEAM_TEST_JOURNAL_MUTATED } from "../constants"

export class TaskTestJournal implements TaskJournal {
  snapshots: TaskSnapshot[] = []

  batches: TaskSnapshot[][] = []

  mutateAndFail = false

  fail = false

  recordTaskCleanup(tasks: TaskSnapshot[]): void {
    if (this.mutateAndFail) {
      for (const task of tasks) {
        task.writeScopes.push(TEAM_TEST_JOURNAL_MUTATED)
        task.blockedBy.push(TEAM_TEST_JOURNAL_MUTATED)
      }
      throw new Error(TEAM_TEST_JOURNAL_FAILURE)
    }
    if (this.fail) {
      throw new Error(TEAM_TEST_JOURNAL_FAILURE)
    }
    this.batches.push(tasks)
    this.snapshots.push(...tasks)
  }

  recordTask(task: TaskSnapshot): void {
    if (this.fail) {
      throw new Error(TEAM_TEST_JOURNAL_FAILURE)
    }
    this.snapshots.push(task)
  }
}
