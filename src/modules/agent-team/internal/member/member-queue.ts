import { type MemberJournal } from "#synapse/modules/agent-team/public/contracts"

export class TeamMemberQueue {
  readonly interrupted: boolean

  private readonly journal: MemberJournal

  private pending: string[] = []

  private unconfirmed: string[]

  constructor(journal: MemberJournal) {
    this.journal = journal
    const checkpoint = journal.load()
    this.interrupted = checkpoint.interrupted
    this.unconfirmed = [...checkpoint.pending]
  }

  get pendingCount(): number {
    return this.pending.length
  }

  get unconfirmedCount(): number {
    return this.unconfirmed.length
  }

  accept(text: string, busy: boolean): void {
    const next = [...this.unconfirmed, text]
    this.save(busy, next)
    this.unconfirmed = next
    this.pending.push(text)
  }

  checkpoint(busy: boolean): void {
    this.save(busy, this.unconfirmed)
  }

  complete(): void {
    this.save(false, this.pending)
    this.unconfirmed = [...this.pending]
  }

  takePending(): string[] {
    const pending = this.pending
    this.pending = []
    return pending
  }

  private save(interrupted: boolean, pending: string[]): void {
    this.journal.save({ interrupted, pending: [...pending] })
  }
}
