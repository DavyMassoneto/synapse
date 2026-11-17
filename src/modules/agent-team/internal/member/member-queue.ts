import { type MemberJournal } from "#synapse/modules/agent-team/public/contracts"
import { type TeamQueuedMessage } from "./types"

export class TeamMemberQueue {
  readonly interrupted: boolean

  private readonly journal: MemberJournal

  private pending: TeamQueuedMessage[] = []

  private unconfirmed: TeamQueuedMessage[]

  private readonly delivered = new Set<TeamQueuedMessage>()

  constructor(journal: MemberJournal) {
    this.journal = journal
    const checkpoint = journal.load()
    this.interrupted = checkpoint.interrupted
    this.unconfirmed = checkpoint.pending.map((text) => ({ text }))
  }

  get pendingCount(): number {
    return this.pending.length
  }

  get unconfirmedCount(): number {
    return this.unconfirmed.length
  }

  accept(text: string, busy: boolean): void {
    const message: TeamQueuedMessage = { text }
    const next = [...this.unconfirmed, message]
    this.save(busy || this.unconfirmed.length > 0, next)
    this.unconfirmed = next
    this.pending.push(message)
  }

  checkpoint(busy: boolean): void {
    this.save(busy || this.unconfirmed.length > 0, this.unconfirmed)
  }

  complete(): void {
    const remaining = this.unconfirmed.filter((message) => !this.delivered.has(message))
    this.save(remaining.length > 0, remaining)
    this.unconfirmed = remaining
    this.delivered.clear()
  }

  interrupt(): void {
    this.save(true, this.unconfirmed)
    this.pending = []
    this.delivered.clear()
  }

  takePending(forPrompt: boolean): string[] {
    const pending = this.pending
    this.pending = []
    return pending.map((message) => {
      if (forPrompt) {
        this.delivered.add(message)
      }
      return message.text
    })
  }

  private save(interrupted: boolean, pending: TeamQueuedMessage[]): void {
    this.journal.save({ interrupted, pending: pending.map((message) => message.text) })
  }
}
