import { type TurnEndEvent } from "@earendil-works/pi-coding-agent"
import { type Advisor } from "#synapse/modules"
import { reminderEntry } from "./reminder-entry"
import { type TurnEndOutcome } from "./types"

export function turnEnd(advisor: Advisor, event: TurnEndEvent): TurnEndOutcome {
  const reminder = advisor.turn({
    completed: event.outcome === "completed",
    usedTools: event.toolResults.length > 0,
  })
  if (reminder.kind === "due") {
    return { entries: [...event.entries, reminderEntry(reminder.text)] }
  }
}
