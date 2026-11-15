import { randomUUID } from "node:crypto"
import {
  type SupervisedShellLease,
  type SupervisedShellLeaseState,
  type SupervisedShellOutput,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import {
  SHELL_WIRE_COMPLETED,
  SHELL_WIRE_CREATED,
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
import { ShellStatusReader } from "./status"
import { type ShellWireProcess, type ShellWireReadyResolve, type ShellWireReject, type ShellWireResolve } from "./types"

export class SupervisedWireLease implements SupervisedShellLease {
  readonly id = randomUUID()
  state: SupervisedShellLeaseState = SHELL_WIRE_STATE_CREATED
  readonly completion: Promise<number>
  private readonly child: ShellWireProcess
  private readonly output: ShellOutputDrain
  private resolve?: ShellWireResolve
  private reject?: ShellWireReject
  private readyResolve?: ShellWireReadyResolve
  private readyReject?: ShellWireReject
  private createdObserved = false
  private readonly status = new ShellStatusReader()
  private released = false
  private exited = false
  private closed = false
  private stopping?: Promise<void>
  private acceptedBytes = 0
  private pendingExit?: number

  constructor(child: ShellWireProcess, output: SupervisedShellOutput) {
    this.child = child
    child.status.on("end", this.onStatusEnd.bind(this))
    this.output = new ShellOutputDrain(child.output, output, this.finishOutput.bind(this), this.onError.bind(this))
    this.completion = new Promise<number>(this.capture.bind(this))
    this.completion.catch(this.observeFailure.bind(this))
    child.status.on("data", this.onStatus.bind(this))
    child.process.on("error", this.onError.bind(this))
    child.process.on("close", this.onClose.bind(this))
  }

  private observeFailure(): void {
    this.state = SHELL_WIRE_STATE_QUARANTINED
  }

  ready(): Promise<void> {
    return new Promise<void>(this.captureCreated.bind(this))
  }
  private captureCreated(resolve: ShellWireReadyResolve, reject: ShellWireReject): void {
    this.readyResolve = resolve
    this.readyReject = reject
    if (this.createdObserved) {
      resolve()
    } else if (this.closed || this.state === SHELL_WIRE_STATE_QUARANTINED) {
      reject(new Error(SHELL_WIRE_INVALID))
    }
  }
  private capture(resolve: ShellWireResolve, reject: ShellWireReject): void {
    this.resolve = resolve
    this.reject = reject
  }

  release(): void {
    if (!this.released && !this.closed) {
      this.status.release()
      this.state = SHELL_WIRE_STATE_RELEASED
      this.released = true
      this.child.input.write(Buffer.from([SHELL_WIRE_GATE_RELEASE]))
    }
  }

  terminate(): Promise<void> {
    if (!this.stopping) {
      this.stopping = this.stop()
    }
    return this.stopping
  }

  private async stop(): Promise<void> {
    if (this.closed && this.state === SHELL_WIRE_STATE_QUARANTINED) {
      throw new Error(SHELL_WIRE_INVALID)
    }
    if (!this.closed) {
      try {
        if (!this.released && this.createdObserved) {
          this.prepareTermination()
        }
        this.child.terminate()
      } catch (error) {
        this.state = SHELL_WIRE_STATE_QUARANTINED
        throw error
      }
      await new Promise<void>(this.waitClosed.bind(this))
      try {
        await this.child.confirmEmpty()
        if (this.child.requiresEmptyAck && !this.status.empty) {
          throw new Error(SHELL_WIRE_INVALID)
        }
        this.state = SHELL_WIRE_STATE_EXITED
      } catch (error) {
        this.state = SHELL_WIRE_STATE_QUARANTINED
        throw error
      }
    }
  }

  private prepareTermination(): void {
    try {
      this.status.release()
    } catch {
      this.state = SHELL_WIRE_STATE_QUARANTINED
    }
  }

  private waitClosed(resolve: ShellWireReadyResolve): void {
    this.child.process.once("close", resolve)
  }

  private onStatus(chunk: Buffer): void {
    try {
      this.status.receive(chunk)
      const state = this.status.state
      if (state.kind === SHELL_WIRE_CREATED) {
        this.createdObserved = true
        this.state = SHELL_WIRE_STATE_ACKNOWLEDGED
        this.readyResolve?.()
      } else if (state.kind === SHELL_WIRE_COMPLETED) {
        this.exited = true
        this.pendingExit = state.exitCode
        this.acceptedBytes = state.acceptedBytes
        this.output.fence(this.acceptedBytes)
      }
    } catch (error) {
      if (error instanceof Error) {
        this.onError(error)
      } else {
        throw error
      }
    }
  }

  private onStatusEnd(): void {
    if (!this.stopping) {
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
    if (typeof this.pendingExit === "number" && this.output.fenced) {
      this.complete(this.pendingExit)
    }
  }
  private complete(exitCode: number): void {
    this.resolve?.(exitCode)
  }
  private onError(error: Error): void {
    this.state = SHELL_WIRE_STATE_QUARANTINED
    if (!this.closed) {
      this.terminate().catch(this.observeFailure.bind(this))
    }
    this.readyReject?.(error)
    this.reject?.(error)
  }
  private onClose(): void {
    this.closed = true
    this.state =
      this.child.requiresEmptyAck && this.status.empty ? SHELL_WIRE_STATE_EXITED : SHELL_WIRE_STATE_QUARANTINED
    if (!this.createdObserved) {
      this.readyReject?.(new Error(SHELL_WIRE_INVALID))
    }
    if (!this.exited) {
      if (this.stopping) {
        this.pendingExit = SHELL_WIRE_KILLED_EXIT
        this.output.fence(this.acceptedBytes)
      } else {
        this.onError(new Error(SHELL_WIRE_INVALID))
      }
    }
  }
}
