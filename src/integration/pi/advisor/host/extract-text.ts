import { type TextBlocks } from "./types"

export function extractText(blocks: TextBlocks): string {
  const parts: string[] = []
  for (const block of blocks) {
    if (block.type === "text") {
      parts.push(block.text)
    }
  }
  return parts.join("\n")
}
