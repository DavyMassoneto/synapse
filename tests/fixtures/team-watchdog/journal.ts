import { type MemberCheckpoint, type MemberJournal } from "#synapse/modules/agent-team"

export class WatchdogJournal implements MemberJournal {
  private checkpoint: MemberCheckpoint = { interrupted: false, pending: [] }

  load(): MemberCheckpoint {
    return this.checkpoint
  }

  save(checkpoint: MemberCheckpoint): void {
    this.checkpoint = checkpoint
  }
}
