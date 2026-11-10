import { type Finding } from "#evaluator/review-result"
import { ITEM_BREAK, UNPLACED_TITLE } from "./constants"
import { unplacedItem } from "./unplaced-item"

export function unplacedSection(unplaced: Finding[]): string[] {
  if (unplaced.length === 0) {
    return []
  }
  const items = unplaced.map(unplacedItem)
  return [[UNPLACED_TITLE, ...items].join(ITEM_BREAK)]
}
