import { RESPONSE_RULES_ABSENT, RESPONSE_RULES_FOUND, RESPONSE_RULES_SECTION_PATTERN } from "./constants"
import { type ResponseRulesTextResult } from "./types"

export function extractResponseRulesSection(instructions: string): ResponseRulesTextResult {
  const section = instructions.match(RESPONSE_RULES_SECTION_PATTERN)?.[1]?.trim()
  if (section) {
    return { kind: RESPONSE_RULES_FOUND, text: section }
  }
  return { kind: RESPONSE_RULES_ABSENT }
}
