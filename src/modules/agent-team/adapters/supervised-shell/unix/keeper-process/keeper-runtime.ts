import { type ChildProcess } from "node:child_process"
import { Socket } from "node:net"
import { type Readable, type Writable } from "node:stream"
import { type ShellWireSpec } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import {
  UNIX_CONTROL_INVALID,
  UNIX_CONTROL_RELEASE,
  UNIX_CONTROL_STOP,
  UNIX_KEEPER_CONTROL_FD,
  UNIX_KEEPER_EVENT_CLOSE,
  UNIX_KEEPER_EVENT_DATA,
  UNIX_KEEPER_EVENT_DRAIN,
  UNIX_KEEPER_EVENT_END,
  UNIX_KEEPER_EVENT_ERROR,
  UNIX_NATIVE_FAILURE_EXIT,
  UNIX_NATIVE_RECHECK_MS,
  UNIX_NATIVE_STOP_BUDGET_NS,
} from "./constants"
import { UnixControlDecoder } from "./control-decoder"
import { launchUnixNative } from "./native-launch"
import { type UnixNativeDeadlineTimer, type UnixShellExitStatus } from "./types"

export class UnixKeeper {
  private readonly spec: ShellWireSpec
  private readonly executable: string
  private readonly control = new Socket({ fd: UNIX_KEEPER_CONTROL_FD, readable: true, writable: false })
  private input?: Writable
  private statusInput?: Readable
  private readonly decoder = new UnixControlDecoder()
  private deadline?: bigint
  private timer?: UnixNativeDeadlineTimer
  private failure = false
  constructor(spec: ShellWireSpec, executable: string) {
    this.spec = spec
    this.executable = executable
  }
  run(): void {
    const native = launchUnixNative(this.spec, this.executable)
    this.input = native.input
    this.statusInput = native.status
    this.bindEvents(native.child, native.input, native.status)
  }
  private bindEvents(child: ChildProcess, input: Writable, status: Readable): void {
    input.on(UNIX_KEEPER_EVENT_ERROR, this.eof.bind(this))
    status.on(UNIX_KEEPER_EVENT_ERROR, this.failed.bind(this))
    status.on(UNIX_KEEPER_EVENT_DATA, this.status.bind(this))
    child.on(UNIX_KEEPER_EVENT_ERROR, this.failed.bind(this))
    child.on(UNIX_KEEPER_EVENT_CLOSE, this.closed.bind(this))
    process.stdout.on(UNIX_KEEPER_EVENT_ERROR, this.failed.bind(this))
    this.control.on(UNIX_KEEPER_EVENT_DATA, this.receive.bind(this))
    this.control.on(UNIX_KEEPER_EVENT_END, this.eof.bind(this))
    this.control.on(UNIX_KEEPER_EVENT_ERROR, this.eof.bind(this))
    this.control.resume()
  }
  private status(bytes: Buffer): void {
    if (this.deadline && process.hrtime.bigint() >= this.deadline) {
      this.failed()
    } else {
      if (!process.stdout.write(bytes)) {
        this.statusInput?.pause()
        process.stdout.once(UNIX_KEEPER_EVENT_DRAIN, this.resumeStatus.bind(this))
      }
    }
  }
  private resumeStatus(): void {
    if (!this.deadline || process.hrtime.bigint() < this.deadline) {
      this.statusInput?.resume()
    } else {
      this.failed()
    }
  }
  private receive(bytes: Buffer): void {
    this.input?.write(bytes)
    for (const instruction of this.decoder.receive(bytes)) {
      if (instruction.kind !== UNIX_CONTROL_RELEASE) {
        this.stop(process.hrtime.bigint() + UNIX_NATIVE_STOP_BUDGET_NS)
        if (instruction.kind === UNIX_CONTROL_INVALID) {
          this.input?.end()
        } else if (instruction.kind === UNIX_CONTROL_STOP) {
          this.stop(instruction.deadline)
        }
      }
    }
  }

  private stop(deadline: bigint): void {
    if (!this.deadline || deadline < this.deadline) {
      const maximum = process.hrtime.bigint() + UNIX_NATIVE_STOP_BUDGET_NS
      this.deadline = deadline < maximum ? deadline : maximum
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.timer = setInterval(this.checkDeadline.bind(this), UNIX_NATIVE_RECHECK_MS)
    }
  }
  private checkDeadline(): void {
    if (this.deadline && process.hrtime.bigint() >= this.deadline) {
      this.failed()
    }
  }
  private eof(): void {
    if (!this.deadline) {
      this.stop(process.hrtime.bigint() + UNIX_NATIVE_STOP_BUDGET_NS)
    }
    this.input?.end()
  }
  private failed(): void {
    this.failure = true
    process.exitCode = UNIX_NATIVE_FAILURE_EXIT
    if (this.timer) {
      clearInterval(this.timer)
    }
    this.input?.destroy()
    this.control.destroy()
    process.stdout.end()
  }
  private closed(code: UnixShellExitStatus): void {
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (this.failure || (this.deadline && process.hrtime.bigint() >= this.deadline)) {
      process.exitCode = UNIX_NATIVE_FAILURE_EXIT
    } else if (typeof code === "number") {
      process.exitCode = code
    } else {
      process.exitCode = UNIX_NATIVE_FAILURE_EXIT
    }
    this.control.destroy()
    process.stdout.end()
  }
}
