import { type Source } from "../source"

export type SizeOf<Item> = (item: Item) => number

export interface SplitChunks {
  chunks: Source[][]
  skipped: number
}
