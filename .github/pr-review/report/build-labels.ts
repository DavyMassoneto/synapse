import { type RuleGroup } from "../rules"
import { fillTemplate } from "../templates"
import { RULE_LABEL } from "./constants"
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
