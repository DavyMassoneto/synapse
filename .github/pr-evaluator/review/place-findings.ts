import { type DiffLines, hasDiffLine, hasDiffRange } from "../diff"
import { type ReviewComment } from "../github"
import { type Finding } from "../model"
import { commentBody } from "./format"
import { type Anchor, type Anchored, type Group, type Placement } from "./types"

function anchorOf(lines: DiffLines, finding: Finding): Anchor {
  if (!hasDiffLine(lines, finding.path, finding.side, finding.line)) {
    return { kind: "floating" }
  }
  const anchor: Anchored = { kind: "anchored", path: finding.path, side: finding.side, line: finding.line }
  if (
    typeof finding.startLine === "number" &&
    hasDiffRange(lines, finding.path, finding.side, finding.startLine, finding.line)
  ) {
    anchor.startLine = finding.startLine
  }
  return anchor
}

function rangeStart(anchor: Anchored): number {
  if (typeof anchor.startLine === "number") {
    return anchor.startLine
  }
  return anchor.line
}

function groupKey(anchor: Anchored): string {
  return `${anchor.path}:${anchor.side}:${rangeStart(anchor)}:${anchor.line}`
}

function toComment(group: Group): ReviewComment {
  const { anchor } = group
  const comment: ReviewComment = {
    path: anchor.path,
    line: anchor.line,
    side: anchor.side,
    body: commentBody(group.findings),
  }
  if (typeof anchor.startLine === "number") {
    comment.start_line = anchor.startLine
    comment.start_side = anchor.side
  }
  return comment
}

function addToGroup(groups: Map<string, Group>, anchor: Anchored, finding: Finding): void {
  const key = groupKey(anchor)
  const group = groups.get(key)
  if (group instanceof Object) {
    group.findings.push(finding)
  } else {
    groups.set(key, { anchor, findings: [finding] })
  }
}

export function placeFindings(lines: DiffLines, findings: Finding[]): Placement {
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
  return { comments: [...groups.values()].map(toComment), unplaced }
}
