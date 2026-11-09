import { RULE_PATTERN } from "./constants"
import { type Rule } from "./types"

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
