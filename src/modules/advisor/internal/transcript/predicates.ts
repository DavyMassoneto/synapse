import { type TranscriptMessage } from "#synapse/modules/advisor/public/contracts"

export function hasClippedText(message: TranscriptMessage): boolean {
  return message.kind === "toolResult" || message.kind === "shell" || message.kind === "custom"
}

export function hasResizableContent(message: TranscriptMessage): boolean {
  return hasClippedText(message) || message.blocks.some((block) => block.kind === "call")
}

export function isHiddenShell(message: TranscriptMessage): boolean {
  return message.kind === "shell" && message.hidden
}
