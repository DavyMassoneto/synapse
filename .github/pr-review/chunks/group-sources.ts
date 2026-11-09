import { type Source } from "../source"
import { CHUNK_CHARS } from "./constants"

export function groupSources(sources: Source[]): Source[][] {
  const chunks: Source[][] = []
  let current: Source[] = []
  let currentChars = 0
  for (const source of sources) {
    if (current.length > 0 && currentChars + source.text.length > CHUNK_CHARS) {
      chunks.push(current)
      current = []
      currentChars = 0
    }
    current.push(source)
    currentChars += source.text.length
  }
  chunks.push(current)
  return chunks
}
