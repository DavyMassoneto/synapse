import { SUPERVISED_SHELL_STOP_FAILED } from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { SHELL_CLEANUP_VALUE, SHELL_CLEANUP_VOID } from "./constants"
import {
  type ShellCaptureOutcome,
  type ShellCleanupAction,
  type ShellCleanupOutcome,
  type ShellOperationInput,
  type ShellOperationOutcome,
} from "./types"

export function captureShellCleanup(action: ShellCleanupAction): Promise<ShellCleanupOutcome>
export function captureShellCleanup<T>(action: Promise<T>): Promise<ShellOperationOutcome<T>>
export async function captureShellCleanup<T>(action: ShellOperationInput<T>): Promise<ShellCaptureOutcome<T>> {
  try {
    if (typeof action === "function") {
      await action()
      return { failed: false, kind: SHELL_CLEANUP_VOID }
    } else {
      return { failed: false, kind: SHELL_CLEANUP_VALUE, value: await action }
    }
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
