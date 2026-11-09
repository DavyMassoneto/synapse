import { type TranscriptBlock } from "#synapse/modules"
import { type MessageContent } from "./types"

export function convertContent(content: MessageContent): TranscriptBlock[] {
  if (typeof content === "string") {
    return [{ kind: "text", text: content }]
  }

  const blocks: TranscriptBlock[] = []
  for (const block of content) {
    if (block.type === "text") {
      blocks.push({ kind: "text", text: block.text })
    } else {
      blocks.push({ kind: "image" })
    }
  }
  return blocks
}
