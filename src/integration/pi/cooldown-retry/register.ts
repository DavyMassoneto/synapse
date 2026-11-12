import { COOLDOWN_MESSAGE_END } from "./constants"
import { rewriteCooldownError } from "./rewrite-cooldown-error"
import { type CooldownRetryHost } from "./types"

export function registerCooldownRetry(pi: CooldownRetryHost): void {
  pi.on(COOLDOWN_MESSAGE_END, rewriteCooldownError)
}
