import { type ToolResultEvent } from "@earendil-works/pi-coding-agent"
import { type Advisor } from "#synapse/modules"
import { ADVISOR_NAME } from "../constants"

export function toolResult(advisor: Advisor, event: ToolResultEvent): undefined {
  if (event.toolName === ADVISOR_NAME) {
    advisor.reminder.reset()
  }
}
