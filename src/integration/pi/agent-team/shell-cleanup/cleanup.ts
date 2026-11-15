import { SUPERVISED_SHELL_STOP_FAILED } from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { type ShellCleanupAction, type ShellCleanupOutcome, type ShellOperationOutcome } from "./types"

export async function captureShellCleanup<T>(action: ShellCleanupAction<T>): Promise<ShellOperationOutcome<T>> {
  try {
    return { failed: false, value: await action() }
  } catch (failure) {
    if (failure instanceof Error) {
      return { failed: true, error: failure }
    }
    if (typeof failure === "string") {
      return { failed: true, error: new Error(failure) }
    }
    return { failed: true, error: new Error(SUPERVISED_SHELL_STOP_FAILED) }
  }
}

export async function finishShellCleanups(attempts: Promise<ShellCleanupOutcome>[], message: string): Promise<void> {
  const failures: Error[] = []
  for (const result of await Promise.all(attempts)) {
    if (result.failed) {
      failures.push(result.error)
    }
  }
  if (failures.length > 0) {
    throw new AggregateError(failures, message)
  }
}
