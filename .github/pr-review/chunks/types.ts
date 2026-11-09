import { type Source } from "../source"

export interface SplitChunks {
  chunks: Source[][]
  skipped: number
}
