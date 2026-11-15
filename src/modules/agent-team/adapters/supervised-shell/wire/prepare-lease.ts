import { type SupervisedShellLease } from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { type SupervisedWireLease } from "./lease"

export async function prepareShellLease(
  lease: SupervisedWireLease,
  signal?: AbortSignal,
): Promise<SupervisedShellLease> {
  try {
    await lease.ready()
    return lease
  } catch (error) {
    await lease.terminate()
    if (signal?.aborted && signal.reason instanceof Error) {
      throw signal.reason
    }
    throw error
  }
}
