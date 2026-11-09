import { type Finding } from "../review"
import { LIST_SEPARATOR } from "../separators"
import { fillTemplate } from "../templates"
import { COUNT_ENTRY } from "./constants"
import { labelOf } from "./label-of"
import { type RuleLabels } from "./types"

function countOf(counts: Map<string, number>, rule: string): number {
  const count = counts.get(rule)
  if (count === undefined) {
    return 0
  }
  return count
}

export function countByRule(labels: RuleLabels, findings: Finding[]): string {
  const counts = new Map<string, number>()
  for (const finding of findings) {
    counts.set(finding.rule, countOf(counts, finding.rule) + 1)
  }
  const entries = [...counts.entries()].sort((left, right) => right[1] - left[1])
  return entries
    .map((entry) => fillTemplate(COUNT_ENTRY, [labelOf(labels, entry[0]), String(entry[1])]))
    .join(LIST_SEPARATOR)
}
