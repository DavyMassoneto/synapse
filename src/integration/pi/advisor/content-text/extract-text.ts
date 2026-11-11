import { TEXT_BREAK } from "./constants"
import { type MessageContentBlocks } from "./types"

export function extractText(blocks: MessageContentBlocks): string {
  const texts: string[] = []
  for (const block of blocks) {
    if (block.type === "text") {
      texts.push(block.text)
    }
  }
  return texts.join(TEXT_BREAK)
}
