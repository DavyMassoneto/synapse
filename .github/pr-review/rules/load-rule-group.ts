import { join } from "node:path"
import { readText } from "../source"
import { RULES_DIR, RULES_SUFFIX } from "./constants"
import { parseRules } from "./parse-rules"
import { type RuleGroup } from "./types"

export function loadRuleGroup(name: string): RuleGroup {
  const text = readText(join(RULES_DIR, name + RULES_SUFFIX))
  return { name, text, rules: parseRules(text) }
}
