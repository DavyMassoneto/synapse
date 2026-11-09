import { type TurnEndEvent } from "@earendil-works/pi-coding-agent"
import { type Advisor } from "#synapse/modules"
import { type TurnEndOutcome } from "../contracts"
import { reminderEntry } from "./reminder-entry"

export function turnEnd(advisor: Advisor, event: TurnEndEvent): TurnEndOutcome {
  const reminder = advisor.turn({
    completed: event.outcome === "completed",
    usedTools: event.toolResults.length > 0,
  })
  if (!reminder) {
    return undefined
  }
  return { entries: [...event.entries, reminderEntry(reminder)] }
}
