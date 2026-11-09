import { clip } from "./clip"
import { OMITTED_MESSAGES, SEPARATOR } from "./constants"
import { selectRecent } from "./select-recent"

export function selectMessages(blocks: string[], budget: number): string {
  const first = blocks[0]
  const last = blocks[blocks.length - 1]
  if (first === undefined || last === undefined) {
    return ""
  }
  const marker = OMITTED_MESSAGES
  if (budget <= marker.length) {
    return clip(last, budget)
  }

  const firstBudget = Math.floor((budget - marker.length - SEPARATOR.length * 2) / 2)
  if (firstBudget <= 0) {
    return clip(first, budget)
  }

  const clippedFirst = clip(first, firstBudget)
  const remaining = budget - clippedFirst.length - marker.length - SEPARATOR.length
  const selected = selectRecent(blocks, remaining)
  return [clippedFirst, marker, ...selected].join(SEPARATOR)
}
