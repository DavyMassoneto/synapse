import { ChildProcess } from "node:child_process"
import { PassThrough } from "node:stream"
import { SupervisedWireLease } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import { type SupervisedShellOutput } from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { SHELL_LEASE_TRANSPORT_FAILURE } from "./constants"
import { type ShellTestReject, type ShellTestResolve } from "./types"

export class ShellLifecycleScenario implements SupervisedShellOutput {
  readonly process = new ChildProcess()
  readonly status = new PassThrough()
  readonly output = new PassThrough()
  readonly input = new PassThrough()
  readonly lease: SupervisedWireLease
  kills = 0
  confirmations = 0
  confirmationFails = false
  confirmationPending = false
  sinkPending = false
  sinkFails = false
  synchronousClose = false
  private resolveConfirmation?: ShellTestResolve
  private resolveSink?: ShellTestResolve
  private rejectSink?: ShellTestReject
  constructor(windows: boolean, signal?: AbortSignal) {
    this.lease = new SupervisedWireLease(
      {
        process: this.process,
        status: this.status,
        output: this.output,
        input: this.input,
        requiresEmptyAck: windows,
        terminate: this.terminate.bind(this),
        confirmEmpty: this.confirmEmpty.bind(this),
      },
      this,
      signal,
    )
  }
  async write(): Promise<void> {
    if (this.sinkFails) {
      throw new Error(SHELL_LEASE_TRANSPORT_FAILURE)
    }
    if (this.sinkPending) {
      await new Promise<void>(this.captureSink.bind(this))
    }
  }
  private captureSink(resolve: ShellTestResolve, reject: ShellTestReject): void {
    this.rejectSink = reject
    this.resolveSink = resolve
  }
  private terminate(): void {
    this.kills++
    if (this.synchronousClose) {
      this.close(false)
    }
  }
  private async confirmEmpty(): Promise<void> {
    this.confirmations++
    if (this.confirmationPending) {
      await new Promise<void>(this.captureConfirmation.bind(this))
    }
    if (this.confirmationFails) {
      throw new Error(SHELL_LEASE_TRANSPORT_FAILURE)
    }
  }
  private captureConfirmation(resolve: ShellTestResolve): void {
    this.resolveConfirmation = resolve
  }
  confirm(): void {
    this.resolveConfirmation?.()
  }
  rejectDelivery(): void {
    this.rejectSink?.(new Error(SHELL_LEASE_TRANSPORT_FAILURE))
  }
  deliver(): void {
    this.resolveSink?.()
  }
  async prepare(): Promise<void> {
    const ready = this.lease.ready()
    this.status.write(Buffer.from([1]))
    await ready
  }
  result(bytes: number): void {
    const frame = Buffer.alloc(9)
    frame[0] = 2
    frame.writeUInt32BE(bytes, 5)
    this.status.write(frame)
  }
  close(windows: boolean): void {
    if (windows) {
      this.status.write(Buffer.from([3]))
    }
    this.output.end()
    this.process.emit("close", 137)
  }
}
