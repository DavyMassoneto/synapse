import { type TranscriptMessage } from "#synapse/modules/advisor/public/contracts"

export function hasClippedText(message: TranscriptMessage): boolean {
  return message.kind === "toolResult" || message.kind === "shell" || message.kind === "custom"
}
