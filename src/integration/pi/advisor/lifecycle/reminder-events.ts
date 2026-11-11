import { type TurnEndEvent } from "@earendil-works/pi-coding-agent"
import { type Advisor } from "#synapse/modules"
import { COMPLETED_TURN, CUSTOM_MESSAGE_ENTRY, REMINDER_DISPLAY, REMINDER_TYPE } from "./constants"
import { type TurnEndOutcome } from "./types"

export class ReminderEvents {
  private readonly advisor: Advisor

  constructor(advisor: Advisor) {
    this.advisor = advisor
  }

  turnEnd(event: TurnEndEvent): TurnEndOutcome {
    const reminder = this.advisor.turn({
      completed: event.outcome === COMPLETED_TURN,
      usedTools: event.toolResults.length > 0,
    })
    if (reminder.kind === "due") {
      return {
        entries: [
          ...event.entries,
          { type: CUSTOM_MESSAGE_ENTRY, customType: REMINDER_TYPE, content: reminder.text, display: REMINDER_DISPLAY },
        ],
      }
    }
  }
}
