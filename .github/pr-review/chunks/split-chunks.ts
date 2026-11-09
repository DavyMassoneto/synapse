import { type Source } from "../source"
import { CHUNK_CHARS, MAX_CHUNKS } from "./constants"
import { type SplitChunks } from "./types"

export function splitChunks(sources: Source[]): SplitChunks {
  const chunks = groupSources(sources)
  return { chunks: chunks.slice(0, MAX_CHUNKS), skipped: Math.max(0, chunks.length - MAX_CHUNKS) }
}

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
