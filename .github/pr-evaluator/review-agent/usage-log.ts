import { type AgentSessionEvent } from "@earendil-works/pi-coding-agent"
import {
  ASSISTANT,
  CACHE_LABEL,
  INPUT_LABEL,
  MESSAGE_END,
  OUTPUT_LABEL,
  ROUND_LABEL,
  TOOL_EXECUTION_START,
  TOOL_LABEL,
  TOOL_SEPARATOR,
} from "./constants"

export function logReviewEvent(event: AgentSessionEvent, round: number): void {
  if (event.type === MESSAGE_END && event.message.role === ASSISTANT) {
    const usage = event.message.usage
    console.error(
      `${ROUND_LABEL}${round}${INPUT_LABEL}${usage.input}${OUTPUT_LABEL}${usage.output}${CACHE_LABEL}${usage.cacheRead}`,
    )
  }
  if (event.type === TOOL_EXECUTION_START) {
    console.error(`${TOOL_LABEL}${JSON.stringify(event.toolName)}${TOOL_SEPARATOR}${JSON.stringify(event.args)}`)
  }
}
