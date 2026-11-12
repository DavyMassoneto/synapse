import { COOLDOWN_ERROR_PATTERN, RATE_LIMIT_PATTERN } from "./constants"

export function isCooldownErrorRewritable(errorMessage: string): boolean {
  return COOLDOWN_ERROR_PATTERN.test(errorMessage) && !RATE_LIMIT_PATTERN.test(errorMessage)
}
