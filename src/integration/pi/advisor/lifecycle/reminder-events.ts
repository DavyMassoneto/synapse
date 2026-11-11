import { type ToolResultEvent, type TurnEndEvent } from "@earendil-works/pi-coding-agent"
import { type Advisor } from "#synapse/modules"
import { ADVISOR_NAME } from "../tool"
import { REMINDER_DISPLAY, REMINDER_TYPE } from "./constants"
import { type TurnEndOutcome } from "./types"

export class ReminderEvents {
  private readonly advisor: Advisor

  constructor(advisor: Advisor) {
    this.advisor = advisor
  }

  toolResult(event: ToolResultEvent): void {
    if (event.toolName === ADVISOR_NAME) {
      this.advisor.reminder.reset()
    }
  }

  turnEnd(event: TurnEndEvent): TurnEndOutcome {
    const reminder = this.advisor.turn({
      completed: event.outcome === "completed",
      usedTools: event.toolResults.length > 0,
    })
    if (reminder.kind === "due") {
      return {
        entries: [
          ...event.entries,
          { type: "custom_message", customType: REMINDER_TYPE, content: reminder.text, display: REMINDER_DISPLAY },
        ],
      }
    }
  }
}
