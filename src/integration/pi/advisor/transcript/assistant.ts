import { type AssistantMessage } from "@earendil-works/pi-ai"
import { type TranscriptBlock, type TranscriptMessage } from "#synapse/modules"

export function convertAssistant(message: AssistantMessage): TranscriptMessage {
  const blocks: TranscriptBlock[] = []
  for (const block of message.content) {
    if (block.type === "text") {
      blocks.push({ kind: "text", text: block.text })
    } else if (block.type === "toolCall") {
      blocks.push({ kind: "call", name: block.name, arguments: JSON.stringify(block.arguments) })
    }
  }
  return { kind: "assistant", blocks }
}
