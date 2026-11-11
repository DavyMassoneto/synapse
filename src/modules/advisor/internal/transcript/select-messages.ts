import { clip } from "./clip"
import { FIRST_MESSAGE_SHARE, OMITTED_MESSAGES, SEPARATOR } from "./constants"

function selectRecent(blocks: string[], budget: number): string[] {
  let remaining = budget
  const selected: string[] = []
  for (let index = blocks.length - 1; index > 0; index -= 1) {
    const block = blocks[index]
    const available = remaining - SEPARATOR.length
    if (!block || available <= 0) {
      break
    }
    if (block.length > available) {
      if (selected.length === 0) {
        selected.push(clip(block, available))
      }
      break
    }
    selected.push(block)
    remaining -= block.length + SEPARATOR.length
  }
  return selected.reverse()
}

function selectEdges(first: string, last: string, blocks: string[], budget: number): string {
  if (budget <= OMITTED_MESSAGES.length) {
    return clip(last, budget)
  }
  const firstBudget = Math.floor((budget - OMITTED_MESSAGES.length - SEPARATOR.length * 2) * FIRST_MESSAGE_SHARE)
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
  if (first && last && blocks.length > 1) {
    return selectEdges(first, last, blocks, budget)
  }
  if (first) {
    return clip(first, budget)
  }
  return ""
}
