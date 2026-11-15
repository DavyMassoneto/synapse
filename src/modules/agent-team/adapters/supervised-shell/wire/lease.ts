import { randomUUID } from "node:crypto"
import {
  type SupervisedShellLease,
  type SupervisedShellLeaseState,
  type SupervisedShellOutput,
} from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { ShellWireAuthorization } from "./authorization"
import * as constants from "./constants"
import { ShellWireOwnership } from "./ownership"
import { ShellWirePreparation } from "./preparation"
import { ShellWireResult } from "./result"
import { ShellStatusReader } from "./status"
import { type ShellWirePreparationEmpty, type ShellWireProcess } from "./types"

export class SupervisedWireLease implements SupervisedShellLease {
  readonly id = randomUUID()
  state: SupervisedShellLeaseState = constants.SHELL_WIRE_STATE_CREATED
  private readonly result: ShellWireResult
  readonly completion: Promise<number>
  private readonly child: ShellWireProcess
  private readonly preparation: ShellWirePreparation
  readonly ready: ShellWirePreparation["current"]
  private readonly status = new ShellStatusReader()
  private readonly authorization = new ShellWireAuthorization()
  private closed = false
  private readonly ownership: ShellWireOwnership
  private stopping?: Promise<void>

  constructor(child: ShellWireProcess, output: SupervisedShellOutput, signal?: AbortSignal) {
    this.child = child
    this.ownership = new ShellWireOwnership(child, this.stopFailed.bind(this))
    this.preparation = new ShellWirePreparation(this.onError.bind(this))
    this.ready = this.preparation.current.bind(this.preparation)
    this.result = new ShellWireResult(child, output, this.ownership, this.onOutputError.bind(this))
    this.completion = this.result.completion
    child.status.on(constants.SHELL_WIRE_EVENT_END, this.onStatus.bind(this, undefined))
    child.status.on(constants.SHELL_WIRE_EVENT_ERROR, this.onTransportError.bind(this))
    child.input.on(constants.SHELL_WIRE_EVENT_ERROR, this.onTransportError.bind(this))
    child.status.on(constants.SHELL_WIRE_EVENT_DATA, this.onStatus.bind(this))
    child.process.on(constants.SHELL_WIRE_EVENT_ERROR, this.onError.bind(this))
    child.process.on(constants.SHELL_WIRE_EVENT_CLOSE, this.onClose.bind(this))
    signal?.addEventListener(constants.SHELL_WIRE_EVENT_ABORT, this.onAbort.bind(this), { once: true })
    if (signal?.aborted) {
      this.onAbort()
    }
  }
  private observeFailure(): void {
    this.state = constants.SHELL_WIRE_STATE_QUARANTINED
  }
  release(): void {
    if (this.ownership.requested || this.result.failure || this.closed) {
      throw new Error(constants.SHELL_WIRE_INVALID)
    }
    if (this.authorization.user === constants.SHELL_WIRE_AUTH_FORBIDDEN) {
      this.authorization.authorize()
      this.status.release()
      this.state = constants.SHELL_WIRE_STATE_RELEASED
      this.child.input.write(Buffer.from([constants.SHELL_WIRE_GATE_RELEASE]))
    }
  }
  terminate(): Promise<void> {
    if (!this.stopping) {
      this.authorization.revoke()
      this.preparation.fail(new Error(constants.SHELL_WIRE_INVALID))
      if (this.status.state.kind === constants.SHELL_WIRE_CREATED) {
        this.status.release()
      }
      const owned = this.ownership.stop()
      this.stopping = owned.then(this.stopped.bind(this))
    }
    return this.stopping
  }
  private stopped(): void {
    this.preparation.fail(new Error(constants.SHELL_WIRE_INVALID))
    if (this.child.requiresEmptyAck && !this.status.empty) {
      const error = new Error(constants.SHELL_WIRE_INVALID)
      this.stopFailed(error)
      throw error
    }
    if (!this.result.failure || this.status.state.kind === constants.SHELL_WIRE_PREPARATION_EMPTY) {
      this.state = constants.SHELL_WIRE_STATE_EXITED
    }
    this.result.confirmed()
  }
  private stopFailed(error: Error): void {
    this.state = constants.SHELL_WIRE_STATE_QUARANTINED
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
      if (state.kind === constants.SHELL_WIRE_CREATED) {
        this.onCreated()
      } else if (state.kind === constants.SHELL_WIRE_PREPARATION_EMPTY && chunk) {
        this.onPreparationEmpty(state)
      } else if (state.kind === constants.SHELL_WIRE_COMPLETED) {
        this.completed(state.exitCode, state.acceptedBytes)
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
  private completed(exitCode: number, acceptedBytes: number): void {
    if (this.authorization.user === constants.SHELL_WIRE_AUTH_AUTHORIZED) {
      this.authorization.execution()
    }
    this.result.exited(exitCode, acceptedBytes)
  }
  private acceptProof(): void {
    if (this.status.empty && this.child.preparationTerminal) {
      this.ownership.acknowledgeEmpty()
      const state = this.status.state
      if (state.kind === constants.SHELL_WIRE_PREPARATION_EMPTY && state.reason === constants.SHELL_WIRE_AUTH_FAILED) {
        this.terminate().catch(this.observeFailure.bind(this))
      }
    }
  }
  private onPreparationEmpty(state: ShellWirePreparationEmpty): void {
    if (!this.child.preparationTerminal) {
      throw new Error(constants.SHELL_WIRE_INVALID)
    }
    this.authorization.preparationEmpty(state.reason === constants.SHELL_WIRE_AUTH_CANCELLED, this.ownership.requested)
    let message = constants.SHELL_WIRE_INVALID
    if (state.reason === constants.SHELL_WIRE_AUTH_FAILED) {
      message = state.error
    }
    this.preparation.fail(new Error(message))
    if (state.reason === constants.SHELL_WIRE_AUTH_FAILED) {
      this.result.fail(new Error(state.error))
    }
  }
  private onCreated(): void {
    if (!this.ownership.requested && !this.result.failure) {
      this.state = constants.SHELL_WIRE_STATE_ACKNOWLEDGED
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
      this.state = constants.SHELL_WIRE_STATE_QUARANTINED
    }
    if (!this.ownership.requested && !this.closed) {
      this.onError(error)
    }
  }
  private onError(error: Error): void {
    this.state = constants.SHELL_WIRE_STATE_QUARANTINED
    this.preparation.fail(error)
    this.result.fail(error)
    if (!this.closed) {
      this.terminate().catch(this.observeFailure.bind(this))
    }
  }
  private onAbort(): void {
    this.preparation.fail(new Error(constants.SHELL_WIRE_INVALID))
    this.terminate().catch(this.observeFailure.bind(this))
  }
  private onClose(): void {
    this.closed = true
    if (!this.ownership.requested && !(this.child.preparationTerminal && this.status.empty)) {
      this.onError(new Error(constants.SHELL_WIRE_INVALID))
    }
    this.ownership.close()
  }
}
