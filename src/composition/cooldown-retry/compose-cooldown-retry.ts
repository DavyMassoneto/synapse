import {
  type CooldownRetryHost,
  registerCooldownRetry,
  rewriteCooldownError,
} from "#synapse/integration/pi/cooldown-retry"

export function composeCooldownRetry(pi: CooldownRetryHost): void {
  registerCooldownRetry(pi, rewriteCooldownError)
}
