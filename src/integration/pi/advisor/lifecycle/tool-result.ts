import { type ToolResultEvent } from "@earendil-works/pi-coding-agent"
import { type Advisor } from "#synapse/modules"
import { ADVISOR_NAME } from "../host"

export function toolResult(advisor: Advisor, event: ToolResultEvent): void {
  if (event.toolName === ADVISOR_NAME) {
    advisor.reminder.reset()
  }
}
