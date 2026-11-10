import { type ReminderTurn } from "#synapse/modules/advisor/public/contracts"
import { REMIND_EVERY } from "./constants"

export class ReminderCounter {
  private turns = 0

  reset(): void {
    this.turns = 0
  }

  count(event: ReminderTurn): void {
    if (event.completed) {
      this.turns += 1
    }
  }

  isDue(event: ReminderTurn): boolean {
    return event.completed && event.usedTools && this.turns >= REMIND_EVERY
  }
}
