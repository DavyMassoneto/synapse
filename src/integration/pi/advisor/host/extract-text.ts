import { isTextBlock } from "./predicates"
import { type TextBlocks } from "./types"

export function extractText(blocks: TextBlocks): string {
  return blocks
    .filter(isTextBlock)
    .map((block) => block.text)
    .join("\n")
}
