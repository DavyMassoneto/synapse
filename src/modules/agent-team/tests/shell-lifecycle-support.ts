import { ChildProcess } from "node:child_process"
import { PassThrough } from "node:stream"
import { SupervisedWireLease } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import { type SupervisedShellOutput } from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { SHELL_LEASE_TRANSPORT_FAILURE } from "./constants"
import {
  SHELL_LIFECYCLE_EMPTY_BYTE,
  SHELL_LIFECYCLE_EXIT_BYTE,
  SHELL_LIFECYCLE_EXIT_FRAME_BYTES,
  SHELL_LIFECYCLE_EXIT_OFFSET,
  SHELL_LIFECYCLE_KILLED_CODE,
  SHELL_LIFECYCLE_READY_BYTE,
  SHELL_TEST_EVENT_CLOSE,
} from "./native-fixture-constants"

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
  private confirmation?: PromiseWithResolvers<void>
  private sink?: PromiseWithResolvers<void>
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
      this.sink = Promise.withResolvers<void>()
      await this.sink.promise
    }
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
      this.confirmation = Promise.withResolvers<void>()
      await this.confirmation.promise
    }
    if (this.confirmationFails) {
      throw new Error(SHELL_LEASE_TRANSPORT_FAILURE)
    }
  }
  confirm(): void {
    this.confirmation?.resolve()
  }
  rejectDelivery(): void {
    this.sink?.reject(new Error(SHELL_LEASE_TRANSPORT_FAILURE))
  }
  deliver(): void {
    this.sink?.resolve()
  }
  async prepare(): Promise<void> {
    const ready = this.lease.ready()
    this.status.write(Buffer.from([SHELL_LIFECYCLE_READY_BYTE]))
    await ready
  }
  result(bytes: number): void {
    const frame = Buffer.alloc(SHELL_LIFECYCLE_EXIT_FRAME_BYTES)
    frame[0] = SHELL_LIFECYCLE_EXIT_BYTE
    frame.writeUInt32BE(bytes, SHELL_LIFECYCLE_EXIT_OFFSET)
    this.status.write(frame)
  }
  close(windows: boolean): void {
    if (windows) {
      this.status.write(Buffer.from([SHELL_LIFECYCLE_EMPTY_BYTE]))
    }
    this.output.end()
    this.process.emit(SHELL_TEST_EVENT_CLOSE, SHELL_LIFECYCLE_KILLED_CODE)
  }
}
