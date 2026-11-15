import { type Readable } from "node:stream"
import { type SupervisedShellOutput } from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import {
  SHELL_WIRE_EVENT_CLOSE,
  SHELL_WIRE_EVENT_DATA,
  SHELL_WIRE_EVENT_END,
  SHELL_WIRE_EVENT_ERROR,
  SHELL_WIRE_INVALID,
} from "./constants"
import { type ShellWireReadyResolve, type ShellWireReject } from "./types"

export class ShellOutputDrain {
  bytes = 0
  ended = false
  fenced = false
  private accepted = 0
  private minimum = 0
  private fencing = false
  private pending = 0
  private failure?: Error
  private chain = Promise.resolve()
  private readonly input: Readable
  private readonly sink: SupervisedShellOutput
  private readonly updated: ShellWireReadyResolve
  private readonly failed: ShellWireReject
  constructor(input: Readable, sink: SupervisedShellOutput, updated: ShellWireReadyResolve, failed: ShellWireReject) {
    this.input = input
    this.sink = sink
    this.updated = updated
    this.failed = failed
    input.on(SHELL_WIRE_EVENT_DATA, this.receive.bind(this))
    input.on(SHELL_WIRE_EVENT_END, this.finish.bind(this))
    input.on(SHELL_WIRE_EVENT_ERROR, this.fail.bind(this))
    input.on(SHELL_WIRE_EVENT_CLOSE, this.closed.bind(this))
  }
  private receive(data: Buffer): void {
    if (!this.failure) {
      this.accepted += data.length
      this.pending++
      this.input.pause()
      this.chain = this.chain.then(this.write.bind(this, data))
      this.chain.then(this.resume.bind(this), this.fail.bind(this))
    }
  }
  private async write(data: Buffer): Promise<void> {
    if (!this.failure) {
      await this.sink.write(data)
      this.pending--
      if (!this.failure) {
        this.bytes += data.length
        this.checkFence()
      }
    }
  }
  fence(minimum: number): void {
    this.minimum = minimum
    this.fencing = true
    this.input.resume()
    setImmediate(this.checkFence.bind(this))
  }
  private checkFence(): void {
    if (!this.failure && this.fencing && !this.fenced && this.pending === 0) {
      if (this.bytes >= this.minimum && this.bytes >= this.accepted && this.input.readableLength === 0) {
        this.fenced = true
        this.updated()
      } else if (this.ended) {
        this.fail(new Error(SHELL_WIRE_INVALID))
      }
    }
  }
  private resume(): void {
    if (!this.failure) {
      this.input.resume()
    }
  }
  private finish(): void {
    this.ended = true
    this.checkFence()
  }
  private closed(): void {
    if (!this.ended && !this.fenced) {
      this.fail(new Error(SHELL_WIRE_INVALID))
    }
  }
  fail(error: Error): void {
    if (!this.failure && !this.fenced) {
      this.failure = error
      this.failed(error)
    }
  }
  cancel(): void {
    if (!this.fenced && (this.pending > 0 || this.fencing)) {
      this.fail(new Error(SHELL_WIRE_INVALID))
    }
  }
}
