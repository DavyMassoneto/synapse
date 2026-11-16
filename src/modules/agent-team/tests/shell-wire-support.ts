import { type ChildProcess } from "node:child_process"
import { type PassThrough } from "node:stream"
import { type SupervisedShellOutput } from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { SHELL_LEASE_TEST_OUTPUT_FAILURE } from "./constants"
import { SHELL_LIFECYCLE_KILLED_CODE, SHELL_TEST_EVENT_CLOSE } from "./native-fixture-constants"

export class ShellWireTestOwner {
  kills = 0
  constructor(child: ChildProcess, output: PassThrough) {
    this.child = child
    this.output = output
  }
  private readonly child: ChildProcess
  private readonly output: PassThrough
  terminate(): void {
    this.kills++
    queueMicrotask(this.close.bind(this))
  }
  private close(): void {
    this.output.end()
    this.child.emit(SHELL_TEST_EVENT_CLOSE, SHELL_LIFECYCLE_KILLED_CODE)
  }
  async confirmEmpty(): Promise<void> {
    this.child.removeAllListeners()
  }
}

export class ShellWireTestSink implements SupervisedShellOutput {
  fail = false
  bytes = 0
  async write(data: Buffer): Promise<void> {
    this.bytes += data.length
    if (this.fail) {
      throw new Error(SHELL_LEASE_TEST_OUTPUT_FAILURE)
    }
  }
}
