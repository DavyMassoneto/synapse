import { type DiffLines } from "#evaluator/diff-annotation"
import { type Finding } from "#evaluator/review-result"
import { anchorOf } from "./anchor-of"
import { type Anchored, type GroupsByAnchor, type Placement } from "./types"

function addToGroup(groups: GroupsByAnchor, anchor: Anchored, finding: Finding): void {
  const key = `${anchor.path}:${anchor.side}:${anchor.startLine}:${anchor.line}`
  const group = groups.get(key)
  if (group) {
    group.findings.push(finding)
  } else {
    groups.set(key, { anchor, findings: [finding] })
  }
}

export function placeFindings(lines: DiffLines, findings: Finding[]): Placement {
  const groups: GroupsByAnchor = new Map()
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
