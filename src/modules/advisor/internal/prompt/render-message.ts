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
  NO_TEXT_LIMIT,
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

function textLimitOf(message: TranscriptMessage, limit: number): number {
  if (hasClippedText(message)) {
    return limit
  }
  return NO_TEXT_LIMIT
}

function renderBlock(block: TranscriptBlock, callLimit: number, textLimit: number): string {
  if (block.kind === "image") {
    return IMAGE_OMITTED
  }
  if (block.kind === "call") {
    return `[${TOOL_CALL_LABEL} ${block.name}] ${clip(block.arguments, callLimit)}`
  }
  return clip(block.text, textLimit)
}

export function renderMessage(message: TranscriptMessage, limit: number): string {
  const textLimit = textLimitOf(message, limit)
  const parts = [messageLabel(message)]
  for (const block of message.blocks) {
    parts.push(renderBlock(block, limit, textLimit))
  }
  return parts.join("\n")
}
