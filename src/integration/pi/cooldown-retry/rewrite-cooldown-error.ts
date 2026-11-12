import { type MessageEndEvent, type MessageEndEventResult } from "@earendil-works/pi-coding-agent"
import { COOLDOWN_ASSISTANT_ROLE, COOLDOWN_ERROR_STOP, RATE_LIMIT_PREFIX } from "./constants"
import { isCooldownErrorRewritable } from "./predicates"

export function rewriteCooldownError(event: MessageEndEvent): MessageEndEventResult {
  const message = event.message
  if (message.role !== COOLDOWN_ASSISTANT_ROLE || message.stopReason !== COOLDOWN_ERROR_STOP) {
    return {}
  }
  const errorMessage = message.errorMessage
  if (!errorMessage || !isCooldownErrorRewritable(errorMessage)) {
    return {}
  }
  return { message: { ...message, errorMessage: `${RATE_LIMIT_PREFIX}${errorMessage}` } }
}
