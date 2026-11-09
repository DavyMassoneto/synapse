import { type Finding } from "#evaluator/review-result"
import { unplacedItem } from "./unplaced-item"

export function unplacedSection(unplaced: Finding[]): string[] {
  if (unplaced.length === 0) {
    return []
  }
  return [["### Apontamentos sem linha no diff", ...unplaced.map(unplacedItem)].join("\n")]
}
