import { randomUUID } from "node:crypto"
import {
  type SupervisedShellLease,
  type SupervisedShellLeaseState,
  type SupervisedShellOutput,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { ShellWireCompletion } from "./completion"
import {
  SHELL_WIRE_COMPLETED,
  SHELL_WIRE_CREATED,
  SHELL_WIRE_EVENT_ABORT,
  SHELL_WIRE_EVENT_CLOSE,
  SHELL_WIRE_EVENT_DATA,
  SHELL_WIRE_EVENT_END,
  SHELL_WIRE_EVENT_ERROR,
  SHELL_WIRE_GATE_RELEASE,
  SHELL_WIRE_INVALID,
  SHELL_WIRE_KILLED_EXIT,
  SHELL_WIRE_STATE_ACKNOWLEDGED,
  SHELL_WIRE_STATE_CREATED,
  SHELL_WIRE_STATE_EXITED,
  SHELL_WIRE_STATE_QUARANTINED,
  SHELL_WIRE_STATE_RELEASED,
} from "./constants"
import { ShellOutputDrain } from "./output-drain"
import { ShellWireOwnership } from "./ownership"
import { ShellWirePreparation } from "./preparation"
import { ShellStatusReader } from "./status"
import { type ShellWireProcess } from "./types"

export class SupervisedWireLease implements SupervisedShellLease {
  readonly id = randomUUID()
  state: SupervisedShellLeaseState = SHELL_WIRE_STATE_CREATED
  private readonly execution = new ShellWireCompletion()
  readonly completion = this.execution.result
  private readonly preparation: ShellWirePreparation
  private readonly child: ShellWireProcess
  private readonly output: ShellOutputDrain
  private readonly status = new ShellStatusReader()
  private released = false
  private closed = false
  private readonly ownership: ShellWireOwnership
  private stopping?: Promise<void>
  private failure?: Error
  private ownershipConfirmed = false
  private pendingExit?: number

  constructor(child: ShellWireProcess, output: SupervisedShellOutput, signal?: AbortSignal) {
    this.child = child
    this.ownership = new ShellWireOwnership(child, this.stopFailed.bind(this))
    this.preparation = new ShellWirePreparation(this.onError.bind(this))
    this.output = new ShellOutputDrain(
      child.output,
      output,
      this.finishOutput.bind(this),
      this.onOutputError.bind(this),
    )
    child.status.on(SHELL_WIRE_EVENT_END, this.onStatusEnd.bind(this))
    child.status.on(SHELL_WIRE_EVENT_ERROR, this.onTransportError.bind(this))
    child.input.on(SHELL_WIRE_EVENT_ERROR, this.onTransportError.bind(this))
    child.status.on(SHELL_WIRE_EVENT_DATA, this.onStatus.bind(this))
    child.process.on(SHELL_WIRE_EVENT_ERROR, this.onError.bind(this))
    child.process.on(SHELL_WIRE_EVENT_CLOSE, this.onClose.bind(this))
    signal?.addEventListener(SHELL_WIRE_EVENT_ABORT, this.onAbort.bind(this), { once: true })
    if (signal?.aborted) {
      this.onAbort()
    }
  }
  private observeFailure(): void {
    this.state = SHELL_WIRE_STATE_QUARANTINED
  }
  ready(): Promise<void> {
    return this.preparation.current()
  }
  release(): void {
    if (this.ownership.requested || this.failure || this.closed) {
      throw new Error(SHELL_WIRE_INVALID)
    }
    if (!this.released) {
      this.status.release()
      this.state = SHELL_WIRE_STATE_RELEASED
      this.released = true
      this.child.input.write(Buffer.from([SHELL_WIRE_GATE_RELEASE]))
    }
  }
  terminate(): Promise<void> {
    if (!this.stopping) {
      this.preparation.fail(new Error(SHELL_WIRE_INVALID))
      if (this.status.state.kind === SHELL_WIRE_CREATED) {
        this.status.release()
      }
      const owned = this.ownership.stop()
      this.stopping = owned.then(this.stopped.bind(this))
    }
    return this.stopping
  }
  private stopped(): void {
    this.preparation.fail(new Error(SHELL_WIRE_INVALID))
    if (this.child.requiresEmptyAck && !this.status.empty) {
      const error = new Error(SHELL_WIRE_INVALID)
      this.stopFailed(error)
      throw error
    }
    this.ownershipConfirmed = true
    if (!this.failure) {
      this.state = SHELL_WIRE_STATE_EXITED
    }
    this.finishOutput()
    this.output.cancel()
    if (typeof this.pendingExit !== "number" && !this.failure) {
      this.execution.complete(SHELL_WIRE_KILLED_EXIT)
    }
  }
  private stopFailed(error: Error): void {
    this.failure = error
    this.state = SHELL_WIRE_STATE_QUARANTINED
    this.preparation.fail(error)
    this.execution.fail(error)
  }
  private onStatus(chunk: Buffer): void {
    try {
      this.status.receive(chunk)
      const state = this.status.state
      if (state.kind === SHELL_WIRE_CREATED) {
        if (!this.ownership.requested && !this.failure) {
          this.state = SHELL_WIRE_STATE_ACKNOWLEDGED
          this.preparation.ready()
        } else if (this.ownership.requested) {
          this.status.release()
        }
      } else if (state.kind === SHELL_WIRE_COMPLETED) {
        this.pendingExit = state.exitCode
        this.output.fence(state.acceptedBytes)
      }
    } catch (error) {
      if (error instanceof Error) {
        this.onError(error)
      } else {
        throw error
      }
    }
  }
  private onTransportError(error: Error): void {
    if (!this.ownership.requested) {
      this.onError(error)
    }
  }
  private onStatusEnd(): void {
    if (!this.ownership.requested) {
      try {
        this.status.eof()
      } catch (error) {
        if (error instanceof Error) {
          this.onError(error)
        } else {
          throw error
        }
      }
    }
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
  private onOutputError(error: Error): void {
    if (!this.execution.settled) {
      this.failure = error
      this.state = SHELL_WIRE_STATE_QUARANTINED
    }
    this.execution.fail(error)
    if (!this.ownership.requested && !this.closed) {
      this.onError(error)
    }
  }
  private onError(error: Error): void {
    this.failure = error
    this.state = SHELL_WIRE_STATE_QUARANTINED
    this.preparation.fail(error)
    this.execution.fail(error)
    if (!this.closed) {
      this.terminate().catch(this.observeFailure.bind(this))
    }
  }
  private onAbort(): void {
    this.preparation.fail(new Error(SHELL_WIRE_INVALID))
    this.terminate().catch(this.observeFailure.bind(this))
  }
  private onClose(): void {
    this.closed = true
    if (!this.ownership.requested) {
      this.onError(new Error(SHELL_WIRE_INVALID))
    }
    this.ownership.close()
  }
}
