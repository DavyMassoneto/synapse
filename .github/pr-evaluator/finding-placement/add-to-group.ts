import { isPresentObject } from "#evaluator/presence"
import { type Finding } from "#evaluator/review-result"
import { groupKey } from "./group-key"
import { type Anchored, type Group } from "./types"

export function addToGroup(groups: Map<string, Group>, anchor: Anchored, finding: Finding): void {
  const key = groupKey(anchor)
  const group = groups.get(key)
  if (isPresentObject(group)) {
    group.findings.push(finding)
  } else {
    groups.set(key, { anchor, findings: [finding] })
  }
}
