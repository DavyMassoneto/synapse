import { type Source } from "../source"
import { CHUNK_CHARS, MAX_CHUNKS } from "./constants"
import { groupBySize } from "./group-by-size"
import { type SplitChunks } from "./types"

export function splitChunks(sources: Source[]): SplitChunks {
  const chunks = groupSources(sources)
  return { chunks: chunks.slice(0, MAX_CHUNKS), skipped: Math.max(0, chunks.length - MAX_CHUNKS) }
}

export function groupSources(sources: Source[]): Source[][] {
  return groupBySize(sources, CHUNK_CHARS, (source) => source.text.length)
}
