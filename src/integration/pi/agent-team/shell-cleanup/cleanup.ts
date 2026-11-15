import { SUPERVISED_SHELL_STOP_FAILED } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  type ShellCleanupInput,
  type ShellCleanupOutcome,
  type ShellCleanupReject,
  type ShellOperationOutcome,
} from "./types"

export async function captureShellCleanup<T>(
  action: ShellCleanupInput<T>,
  rejected?: ShellCleanupReject,
): Promise<ShellOperationOutcome<T>> {
  try {
    if (typeof action === "function") {
      return { failed: false, value: await action() }
    }
    return { failed: false, value: await action }
  } catch (failure) {
    let error = new Error(SUPERVISED_SHELL_STOP_FAILED)
    if (failure instanceof Error) {
      error = failure
    } else if (typeof failure === "string") {
      error = new Error(failure)
    }
    rejected?.(error)
    return { failed: true, error }
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
