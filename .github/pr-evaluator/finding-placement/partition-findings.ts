import { type DiffLines } from "#evaluator/changes"
import { type Finding } from "#evaluator/review-result"
import { addToGroup } from "./add-to-group"
import { anchorOf } from "./anchor-of"
import { type Group, type Partition } from "./types"

export function partitionFindings(lines: DiffLines, findings: Finding[]): Partition {
  const groups = new Map<string, Group>()
  const unplaced: Finding[] = []
  for (const finding of findings) {
    const anchor = anchorOf(lines, finding)
    if (anchor.kind === "anchored") {
      addToGroup(groups, anchor, finding)
    } else {
      unplaced.push(finding)
    }
  }
  return { groups, unplaced }
}
