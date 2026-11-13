import { ComputerExecutionCancelled } from "./cancellation"

export function computerCheckCancellation(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new ComputerExecutionCancelled()
  }
}
