import { clip } from "./clip"
import { SEPARATOR } from "./constants"

export function selectRecent(blocks: string[], budget: number): string[] {
  let remaining = budget
  const selected: string[] = []

  for (const block of blocks.slice(1).reverse()) {
    const available = remaining - SEPARATOR.length
    if (available <= 0) {
      break
    }

    if (block.length > available) {
      if (selected.length === 0) {
        selected.unshift(clip(block, available))
      }
      break
    }

    selected.unshift(block)
    remaining -= block.length + SEPARATOR.length
  }

  return selected
}
