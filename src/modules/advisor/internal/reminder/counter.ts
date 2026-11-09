import { type ReminderTurn } from "#synapse/modules/advisor/public/contracts"
import { REMIND_EVERY } from "./constants"

export class ReminderCounter {
  private turns = 0

  reset(): void {
    this.turns = 0
  }

  advance(event: ReminderTurn): boolean {
    if (!event.completed) {
      return false
    }
    this.turns += 1
    if (this.turns < REMIND_EVERY || !event.usedTools) {
      return false
    }
    this.reset()
    return true
  }
}
