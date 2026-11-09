import { type ToolResultTranscript, type TranscriptMessage } from "#synapse/modules/advisor/public/contracts"
import { CONTEXT_LABEL, ERROR_LABEL, SHELL_LABEL, SUMMARY_LABEL, TOOL_RESULT_LABEL } from "./constants"

function toolResultLabel(message: ToolResultTranscript): string {
  if (message.error) {
    return `[${TOOL_RESULT_LABEL} ${message.tool}${ERROR_LABEL}]`
  }
  return `[${TOOL_RESULT_LABEL} ${message.tool}]`
}

export function messageLabel(message: TranscriptMessage): string {
  if (message.kind === "toolResult") {
    return toolResultLabel(message)
  }
  if (message.kind === "shell") {
    return `[${SHELL_LABEL}] $ ${message.command}`
  }
  if (message.kind === "custom") {
    return `[${CONTEXT_LABEL}:${message.customType}]`
  }
  if (message.kind === "summary") {
    return SUMMARY_LABEL
  }
  return `[${message.kind}]`
}
