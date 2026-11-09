import { type SizeOf } from "./types"

export function groupBySize<Item>(items: readonly Item[], limitChars: number, sizeOf: SizeOf<Item>): Item[][] {
  const groups: Item[][] = []
  let current: Item[] = []
  let currentChars = 0
  for (const item of items) {
    const size = sizeOf(item)
    if (current.length > 0 && currentChars + size > limitChars) {
      groups.push(current)
      current = []
      currentChars = 0
    }
    current.push(item)
    currentChars += size
  }
  groups.push(current)
  return groups
}
