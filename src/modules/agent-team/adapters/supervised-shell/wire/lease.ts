import { randomUUID } from "node:crypto"
import {
  type SupervisedShellLease,
  type SupervisedShellLeaseState,
  type SupervisedShellOutput,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { ShellWireAuthorization } from "./authorization"
import {
  SHELL_WIRE_AUTH_AUTHORIZED,
  SHELL_WIRE_AUTH_CANCELLED,
  SHELL_WIRE_AUTH_FAILED,
  SHELL_WIRE_AUTH_FORBIDDEN,
  SHELL_WIRE_COMPLETED,
  SHELL_WIRE_CREATED,
  SHELL_WIRE_EVENT_ABORT,
  SHELL_WIRE_EVENT_CLOSE,
  SHELL_WIRE_EVENT_DATA,
  SHELL_WIRE_EVENT_END,
  SHELL_WIRE_EVENT_ERROR,
  SHELL_WIRE_GATE_RELEASE,
  SHELL_WIRE_INVALID,
  SHELL_WIRE_PREPARATION_EMPTY,
  SHELL_WIRE_STATE_ACKNOWLEDGED,
  SHELL_WIRE_STATE_CREATED,
  SHELL_WIRE_STATE_EXITED,
  SHELL_WIRE_STATE_QUARANTINED,
  SHELL_WIRE_STATE_RELEASED,
} from "./constants"
import { ShellWireOwnership } from "./ownership"
import { ShellWirePreparation } from "./preparation"
import { ShellWireResult } from "./result"
import { ShellStatusReader } from "./status"
import { type ShellWirePreparationEmpty, type ShellWireProcess } from "./types"

export class SupervisedWireLease implements SupervisedShellLease {
  readonly id = randomUUID()
  state: SupervisedShellLeaseState = SHELL_WIRE_STATE_CREATED
  private readonly result: ShellWireResult
  readonly completion: Promise<number>
  private readonly preparation: ShellWirePreparation
  private readonly child: ShellWireProcess
  private readonly status = new ShellStatusReader()
  private readonly authorization = new ShellWireAuthorization()
  private closed = false
  private readonly ownership: ShellWireOwnership
  private stopping?: Promise<void>

  constructor(child: ShellWireProcess, output: SupervisedShellOutput, signal?: AbortSignal) {
    this.child = child
    this.ownership = new ShellWireOwnership(child, this.stopFailed.bind(this))
    this.preparation = new ShellWirePreparation(this.onError.bind(this))
    this.result = new ShellWireResult(child, output, this.ownership, this.onOutputError.bind(this))
    this.completion = this.result.completion
    child.status.on(SHELL_WIRE_EVENT_END, this.onStatus.bind(this, undefined))
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
    if (this.ownership.requested || this.result.failure || this.closed) {
      throw new Error(SHELL_WIRE_INVALID)
    }
    if (this.authorization.user === SHELL_WIRE_AUTH_FORBIDDEN) {
      this.authorization.authorize()
      this.status.release()
      this.state = SHELL_WIRE_STATE_RELEASED
      this.child.input.write(Buffer.from([SHELL_WIRE_GATE_RELEASE]))
    }
  }
  terminate(): Promise<void> {
    if (!this.stopping) {
      this.authorization.revoke()
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
    if (!this.result.failure || this.status.state.kind === SHELL_WIRE_PREPARATION_EMPTY) {
      this.state = SHELL_WIRE_STATE_EXITED
    }
    this.result.confirmed()
  }
  private stopFailed(error: Error): void {
    this.state = SHELL_WIRE_STATE_QUARANTINED
    this.preparation.fail(error)
    this.result.fail(error)
  }
  private onStatus(chunk?: Buffer): void {
    try {
      if (chunk) {
        this.status.receive(chunk)
      } else {
        this.status.eof()
      }
      const state = this.status.state
      if (state.kind === SHELL_WIRE_CREATED) {
        this.onCreated()
      } else if (state.kind === SHELL_WIRE_PREPARATION_EMPTY && chunk) {
        this.onPreparationEmpty(state)
      } else if (state.kind === SHELL_WIRE_COMPLETED) {
        if (this.authorization.user === SHELL_WIRE_AUTH_AUTHORIZED) {
          this.authorization.execution()
        }
        this.result.exited(state.exitCode, state.acceptedBytes)
      }
      this.acceptProof()
    } catch (error) {
      if (error instanceof Error) {
        this.onError(error)
      } else {
        throw error
      }
    }
  }
  private acceptProof(): void {
    if (this.status.empty && this.child.preparationTerminal) {
      this.ownership.acknowledgeEmpty()
      const state = this.status.state
      if (state.kind === SHELL_WIRE_PREPARATION_EMPTY && state.reason === SHELL_WIRE_AUTH_FAILED) {
        this.terminate().catch(this.observeFailure.bind(this))
      }
    }
  }
  private onPreparationEmpty(state: ShellWirePreparationEmpty): void {
    if (!this.child.preparationTerminal) {
      throw new Error(SHELL_WIRE_INVALID)
    }
    this.authorization.preparationEmpty(state.reason === SHELL_WIRE_AUTH_CANCELLED, this.ownership.requested)
    let message = SHELL_WIRE_INVALID
    if (state.reason === SHELL_WIRE_AUTH_FAILED) {
      message = state.error
    }
    this.preparation.fail(new Error(message))
    if (state.reason === SHELL_WIRE_AUTH_FAILED) {
      this.result.fail(new Error(state.error))
    }
  }
  private onCreated(): void {
    if (!this.ownership.requested && !this.result.failure) {
      this.state = SHELL_WIRE_STATE_ACKNOWLEDGED
      this.preparation.ready()
    } else if (this.ownership.requested) {
      this.status.release()
    }
  }
  private onTransportError(error: Error): void {
    if (!this.ownership.requested) {
      this.onError(error)
    }
  }
  private onOutputError(error: Error): void {
    if (this.result.failure) {
      this.state = SHELL_WIRE_STATE_QUARANTINED
    }
    if (!this.ownership.requested && !this.closed) {
      this.onError(error)
    }
  }
  private onError(error: Error): void {
    this.state = SHELL_WIRE_STATE_QUARANTINED
    this.preparation.fail(error)
    this.result.fail(error)
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
    if (!this.ownership.requested && !(this.child.preparationTerminal && this.status.empty)) {
      this.onError(new Error(SHELL_WIRE_INVALID))
    }
    this.ownership.close()
  }
}
