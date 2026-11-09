import { join } from "node:path"
import { readText } from "../source"
import { GROUP_NAMES, RULE_PATTERN, RULES_DIR, RULES_SUFFIX } from "./constants"
import { type Rule, type RuleGroup } from "./types"

export function loadRuleGroups(): RuleGroup[] {
  return GROUP_NAMES.map((name) => loadRuleGroup(name))
}

export function loadRuleGroup(name: string): RuleGroup {
  const text = readText(join(RULES_DIR, name + RULES_SUFFIX))
  return { text, rules: parseRules(text) }
}

export function parseRules(text: string): Rule[] {
  const rules: Rule[] = []
  for (const match of text.matchAll(RULE_PATTERN)) {
    const id = match.at(1)
    const label = match.at(2)
    if (id !== undefined && label !== undefined) {
      rules.push({ id, label })
    }
  }
  return rules
}
