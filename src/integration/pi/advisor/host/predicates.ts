import { type TextContent } from "@earendil-works/pi-ai"
import { type TextBlocks } from "./types"

export function isTextBlock(block: TextBlocks[number]): block is TextContent {
  return block.type === "text"
}
