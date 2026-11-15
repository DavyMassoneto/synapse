import { COOLDOWN_MESSAGE_END } from "./constants"
import { type CooldownMessageEndHandler, type CooldownRetryHost } from "./types"

export function registerCooldownRetry(pi: CooldownRetryHost, rewrite: CooldownMessageEndHandler): void {
  pi.on(COOLDOWN_MESSAGE_END, rewrite)
}
