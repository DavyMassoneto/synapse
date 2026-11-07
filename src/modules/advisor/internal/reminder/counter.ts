import { type ReminderTurn } from "#synapse/modules/advisor/public/reminder.js";

export const REMIND_EVERY = 5;

export class ReminderCounter {
  private turns = 0;

  reset(): void {
    this.turns = 0;
  }

  advance(event: ReminderTurn): boolean {
    if (!event.completed) {
      return false;
    }
    this.turns += 1;
    if (this.turns < REMIND_EVERY || !event.usedTools) {
      return false;
    }
    this.reset();
    return true;
  }
}
