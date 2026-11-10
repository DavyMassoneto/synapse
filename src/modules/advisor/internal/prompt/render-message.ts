import {
  type ToolResultTranscript,
  type TranscriptBlock,
  type TranscriptMessage,
} from "#synapse/modules/advisor/public/contracts"
import { clip } from "./clip"
import {
  CONTEXT_LABEL,
  ERROR_LABEL,
  IMAGE_OMITTED,
  SHELL_LABEL,
  SUMMARY_LABEL,
  TOOL_CALL_LABEL,
  TOOL_RESULT_LABEL,
} from "./constants"
import { hasClippedText } from "./predicates"

function toolResultLabel(message: ToolResultTranscript): string {
  if (message.error) {
    return `[${TOOL_RESULT_LABEL} ${message.tool}${ERROR_LABEL}]`
  }
  return `[${TOOL_RESULT_LABEL} ${message.tool}]`
}

function messageLabel(message: TranscriptMessage): string {
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

function renderBlock(message: TranscriptMessage, block: TranscriptBlock, limit: number): string {
  if (block.kind === "image") {
    return IMAGE_OMITTED
  }
  if (block.kind === "call") {
    return `[${TOOL_CALL_LABEL} ${block.name}] ${clip(block.arguments, limit)}`
  }
  if (hasClippedText(message)) {
    return clip(block.text, limit)
  }
  return block.text
}

export function renderMessage(message: TranscriptMessage, limit: number): string {
  const parts = [messageLabel(message)]
  for (const block of message.blocks) {
    parts.push(renderBlock(message, block, limit))
  }
  return parts.join("\n")
}
