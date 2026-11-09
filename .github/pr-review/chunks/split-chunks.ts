import { type Source } from "../source"
import { MAX_CHUNKS } from "./constants"
import { groupSources } from "./group-sources"
import { type SplitChunks } from "./types"

export function splitChunks(sources: Source[]): SplitChunks {
  const chunks = groupSources(sources)
  return { chunks: chunks.slice(0, MAX_CHUNKS), skipped: Math.max(0, chunks.length - MAX_CHUNKS) }
}
