import { clip } from "./clip"
import { OMITTED_MESSAGES, SEPARATOR } from "./constants"
import { selectRecent } from "./select-recent"

function selectEdges(first: string, last: string, blocks: string[], budget: number): string {
  if (budget <= OMITTED_MESSAGES.length) {
    return clip(last, budget)
  }

  const firstBudget = Math.floor((budget - OMITTED_MESSAGES.length - SEPARATOR.length * 2) / 2)
  if (firstBudget <= 0) {
    return clip(first, budget)
  }

  const clippedFirst = clip(first, firstBudget)
  const remaining = budget - clippedFirst.length - OMITTED_MESSAGES.length - SEPARATOR.length
  const selected = selectRecent(blocks, remaining)
  return [clippedFirst, OMITTED_MESSAGES, ...selected].join(SEPARATOR)
}

export function selectMessages(blocks: string[], budget: number): string {
  const first = blocks[0]
  const last = blocks[blocks.length - 1]
  if (first && last) {
    return selectEdges(first, last, blocks, budget)
  }
  return ""
}
