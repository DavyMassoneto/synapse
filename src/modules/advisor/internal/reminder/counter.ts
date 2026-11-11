import { type ReminderTurn } from "#synapse/modules/advisor/public/contracts"

export class ReminderCounter {
  private $completedTurns = 0

  get turns(): number {
    return this.$completedTurns
  }

  reset(): void {
    this.$completedTurns = 0
  }

  count(event: ReminderTurn): void {
    if (event.completed) {
      this.$completedTurns += 1
    }
  }
}
