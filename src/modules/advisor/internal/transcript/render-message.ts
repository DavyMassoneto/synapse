import {
  type ToolResultTranscript,
  type TranscriptBlock,
  type TranscriptMessage,
} from "#synapse/modules/advisor/public/contracts"
import { clip } from "./clip"
import {
  BLOCK_BREAK,
  CONTEXT_OPEN,
  ERROR_LABEL,
  IMAGE_OMITTED,
  LABEL_CLOSE,
  LABEL_OPEN,
  NO_TEXT_LIMIT,
  SHELL_OPEN,
  SUMMARY_LABEL,
  TOOL_CALL_CLOSE,
  TOOL_CALL_OPEN,
  TOOL_RESULT_OPEN,
} from "./constants"
import { hasClippedText } from "./predicates"

function toolResultLabel(message: ToolResultTranscript): string {
  if (message.error) {
    return `${TOOL_RESULT_OPEN}${message.tool}${ERROR_LABEL}${LABEL_CLOSE}`
  }
  return `${TOOL_RESULT_OPEN}${message.tool}${LABEL_CLOSE}`
}

function messageLabel(message: TranscriptMessage): string {
  if (message.kind === "toolResult") {
    return toolResultLabel(message)
  }
  if (message.kind === "shell") {
    return `${SHELL_OPEN}${message.command}`
  }
  if (message.kind === "custom") {
    return `${CONTEXT_OPEN}${message.customType}${LABEL_CLOSE}`
  }
  if (message.kind === "summary") {
    return SUMMARY_LABEL
  }
  return `${LABEL_OPEN}${message.kind}${LABEL_CLOSE}`
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
    return `${TOOL_CALL_OPEN}${block.name}${TOOL_CALL_CLOSE}${clip(block.arguments, callLimit)}`
  }
  return clip(block.text, textLimit)
}

export function renderMessage(message: TranscriptMessage, limit: number): string {
  const textLimit = textLimitOf(message, limit)
  const lines = message.blocks.map((block) => renderBlock(block, limit, textLimit))
  lines.unshift(messageLabel(message))
  return lines.join(BLOCK_BREAK)
}
