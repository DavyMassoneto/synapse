import { SUPERVISED_SHELL_ABORTED } from "#synapse/modules/agent-team/public/supervised-shell/contracts"

export function createShellCancellation(admission: AbortSignal, external?: AbortSignal): AbortSignal {
  if (external?.aborted) {
    if (external.reason instanceof Error) {
      throw external.reason
    }
    throw new Error(SUPERVISED_SHELL_ABORTED)
  }
  const signals = [admission]
  if (external) {
    signals.push(external)
  }
  return AbortSignal.any(signals)
}
