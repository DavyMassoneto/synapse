import { type RuleGroup } from "#synapse/rules"
import { fillTemplate } from "#synapse/templates"
import { MISSING_RULE_LABEL, RULE_LABEL } from "./constants"
import { type RuleLabels } from "./types"

export function buildLabels(groups: RuleGroup[]): RuleLabels {
  const labels: RuleLabels = new Map<string, string>()
  for (const group of groups) {
    for (const rule of group.rules) {
      labels.set(rule.id, fillTemplate(RULE_LABEL, [rule.id, rule.label]))
    }
  }
  return labels
}

export function labelOf(labels: RuleLabels, ruleId: string): string {
  const label = labels.get(ruleId)
  if (label === undefined) {
    throw new Error(MISSING_RULE_LABEL + ruleId)
  }
  return label
}
