import { type SupervisedShellOutput } from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { ShellWireCompletion } from "./completion"
import { SHELL_WIRE_KILLED_EXIT } from "./constants"
import { ShellOutputDrain } from "./output-drain"
import { type ShellWireOwnership } from "./ownership"
import { type ShellWireProcess, type ShellWireReject } from "./types"

export class ShellWireResult {
  private readonly execution = new ShellWireCompletion()
  readonly completion = this.execution.result
  private readonly output: ShellOutputDrain
  private readonly ownership: ShellWireOwnership
  private readonly failed: ShellWireReject
  private pendingExit?: number
  private ownershipConfirmed = false
  failure?: Error
  constructor(
    child: ShellWireProcess,
    sink: SupervisedShellOutput,
    ownership: ShellWireOwnership,
    failed: ShellWireReject,
  ) {
    this.ownership = ownership
    this.failed = failed
    this.output = new ShellOutputDrain(child.output, sink, this.finishOutput.bind(this), this.outputFailed.bind(this))
  }
  exited(code: number, acceptedBytes: number): void {
    this.pendingExit = code
    this.output.fence(acceptedBytes)
  }
  confirmed(): void {
    this.ownershipConfirmed = true
    this.finishOutput()
    this.output.cancel()
    if (typeof this.pendingExit !== "number" && !this.failure) {
      this.execution.complete(SHELL_WIRE_KILLED_EXIT)
    }
  }
  fail(error: Error): void {
    this.failure = error
    this.execution.fail(error)
  }
  private finishOutput(): void {
    if (
      typeof this.pendingExit === "number" &&
      this.output.fenced &&
      !this.failure &&
      (!this.ownership.requested || this.ownershipConfirmed)
    ) {
      this.execution.complete(this.pendingExit)
    }
  }
  private outputFailed(error: Error): void {
    if (!this.execution.settled) {
      this.failure = error
    }
    this.execution.fail(error)
    this.failed(error)
  }
}
