import { RESPONSE_RULES_MISSING_FILE_CODE } from "./constants"

export function isResponseRulesMissingFile(error: Error): boolean {
  return "code" in error && error.code === RESPONSE_RULES_MISSING_FILE_CODE
}
