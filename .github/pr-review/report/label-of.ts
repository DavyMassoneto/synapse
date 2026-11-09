import { type RuleLabels } from "./types"

export function labelOf(labels: RuleLabels, ruleId: string): string {
  const label = labels.get(ruleId)
  if (label === undefined) {
    return ruleId
  }
  return label
}
