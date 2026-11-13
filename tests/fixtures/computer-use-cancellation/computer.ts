import {
  type ComputerAction,
  type ComputerDiagnostic,
  type ComputerExecuteResult,
  type ComputerExecutionContext,
  type ComputerInstallResult,
  type ComputerUse,
} from "#synapse/modules"
import { COMPUTER_CANCELLATION_COMPLETED, COMPUTER_CANCELLATION_DIAGNOSTIC } from "./constants"

export class CancellationComputer implements ComputerUse {
  result: ComputerExecuteResult = COMPUTER_CANCELLATION_COMPLETED

  calls = 0

  signal?: AbortSignal

  abortOnExecute?: AbortController

  async execute(
    _action: ComputerAction,
    _context: ComputerExecutionContext,
    signal?: AbortSignal,
  ): Promise<ComputerExecuteResult> {
    this.calls++
    if (signal) {
      this.signal = signal
    }
    this.abortOnExecute?.abort()
    return this.result
  }

  async diagnose(): Promise<ComputerDiagnostic> {
    return { kind: "computer-unavailable", message: COMPUTER_CANCELLATION_DIAGNOSTIC }
  }

  async install(): Promise<ComputerInstallResult> {
    return { kind: "computer-install-failed", message: COMPUTER_CANCELLATION_DIAGNOSTIC }
  }

  async stop(): Promise<void> {}
}
