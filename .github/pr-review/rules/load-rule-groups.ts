import { GROUP_NAMES } from "./constants"
import { loadRuleGroup } from "./load-rule-group"
import { type RuleGroup } from "./types"

export function loadRuleGroups(): RuleGroup[] {
  return GROUP_NAMES.map((name) => loadRuleGroup(name))
}
