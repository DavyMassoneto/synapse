import { type TranscriptMessage } from "#synapse/modules/advisor/public/contracts"
import { MINIMAL_CONTENT_LIMIT, ROOMY_CONTENT_LIMITS, SEPARATOR } from "./constants"
import { renderMessage } from "./render-message"
import { selectMessages } from "./select-messages"

function renderMessages(messages: TranscriptMessage[], limit: number): string[] {
  const blocks: string[] = []
  for (const message of messages) {
    const text = renderMessage(message, limit)
    if (text) {
      blocks.push(text)
    }
  }
  return blocks
}

function joinedLength(blocks: string[]): number {
  let length = 0
  for (const block of blocks) {
    length += block.length + SEPARATOR.length
  }
  return Math.max(0, length - SEPARATOR.length)
}

export function buildTranscript(messages: TranscriptMessage[], budget: number): string {
  if (budget <= 0) {
    return ""
  }
  for (const limit of ROOMY_CONTENT_LIMITS) {
    const blocks = renderMessages(messages, limit)
    if (joinedLength(blocks) <= budget) {
      return blocks.join(SEPARATOR)
    }
  }
  const blocks = renderMessages(messages, MINIMAL_CONTENT_LIMIT)
  if (joinedLength(blocks) <= budget) {
    return blocks.join(SEPARATOR)
  }
  return selectMessages(blocks, budget)
}
