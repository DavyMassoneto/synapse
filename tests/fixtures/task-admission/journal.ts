import { type MemberCheckpoint, type MemberJournal } from "#synapse/modules/agent-team"
import { ADMISSION_FAILURE_MESSAGE } from "./constants"

export class AdmissionFailingJournal implements MemberJournal {
  private readonly journal: MemberJournal

  constructor(journal: MemberJournal) {
    this.journal = journal
  }

  load(): MemberCheckpoint {
    return this.journal.load()
  }

  save(_checkpoint: MemberCheckpoint): void {
    throw new Error(ADMISSION_FAILURE_MESSAGE)
  }
}
