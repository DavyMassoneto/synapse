import { type MemberCheckpoint, type MemberJournal } from "#synapse/modules/agent-team"

export class TeamTestMemberJournal implements MemberJournal {
  checkpoint: MemberCheckpoint = { interrupted: false, pending: [] }

  saves = 0

  failAt = 0

  failLoad = false

  load(): MemberCheckpoint {
    if (this.failLoad) {
      throw new Error("checkpoint-invalid")
    }
    return { ...this.checkpoint, pending: [...this.checkpoint.pending] }
  }

  save(checkpoint: MemberCheckpoint): void {
    this.saves += 1
    if (this.saves === this.failAt) {
      throw new Error("journal indisponível")
    }
    this.checkpoint = { ...checkpoint, pending: [...checkpoint.pending] }
  }
}
