import { type ReminderTurn } from "#synapse/modules/advisor/public/contracts"
import { REMIND_EVERY } from "./constants"

export function isReminderDue(turns: number, event: ReminderTurn): boolean {
  return event.completed && event.usedTools && turns >= REMIND_EVERY
}
