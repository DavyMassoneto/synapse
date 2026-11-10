import { type TextBlocks } from "./types"

export function extractText(blocks: TextBlocks): string {
  const texts: string[] = []
  for (const block of blocks) {
    if (block.type === "text") {
      texts.push(block.text)
    }
  }
  return texts.join("\n")
}
