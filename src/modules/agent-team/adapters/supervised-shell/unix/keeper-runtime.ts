import { type ChildProcess, spawn } from "node:child_process"
import { closeSync } from "node:fs"
import { Socket } from "node:net"
import { type Readable, type Writable } from "node:stream"
import { SHELL_WIRE_GATE_RELEASE, type ShellWireSpec } from "../wire"
import {
  UNIX_KEEPER_CONTROL_FD,
  UNIX_KEEPER_EVENT_CLOSE,
  UNIX_KEEPER_EVENT_DATA,
  UNIX_KEEPER_EVENT_END,
  UNIX_KEEPER_EVENT_ERROR,
  UNIX_KEEPER_INVALID,
  UNIX_KEEPER_STDERR_FD,
  UNIX_NATIVE_CONTROL_FD,
  UNIX_NATIVE_FAILURE_EXIT,
  UNIX_NATIVE_RECHECK_MS,
  UNIX_NATIVE_STATUS_FD,
  UNIX_NATIVE_STDIO,
  UNIX_NATIVE_STOP,
  UNIX_NATIVE_STOP_BUDGET_NS,
  UNIX_NATIVE_STOP_BYTES,
  UNIX_PARENT_STDIN_FD,
} from "./constants"
import { type UnixKeeperChunk, type UnixNativeDeadlineTimer, type UnixShellExitStatus } from "./types"

export class UnixKeeper {
  private readonly spec: ShellWireSpec
  private readonly executable: string
  private readonly control = new Socket({ fd: UNIX_KEEPER_CONTROL_FD, readable: true, writable: false })
  private native?: ChildProcess
  private input?: Writable
  private statusInput?: Readable
  private pending = Buffer.alloc(0)
  private deadline?: bigint
  private timer?: UnixNativeDeadlineTimer
  private failure = false
  constructor(spec: ShellWireSpec, executable: string) {
    this.spec = spec
    this.executable = executable
  }
  run(): void {
    const environment: NodeJS.ProcessEnv = {}
    for (const entry of this.spec.environment) {
      environment[entry.name] = entry.value
    }
    this.native = spawn(this.executable, [this.spec.cwd, this.spec.executable, ...this.spec.arguments], {
      env: environment,
      stdio: UNIX_NATIVE_STDIO,
    })
    const input = this.native.stdio[UNIX_NATIVE_CONTROL_FD]
    const status = this.native.stdio[UNIX_NATIVE_STATUS_FD]
    if (!input || !("write" in input) || !status || !("read" in status)) {
      throw new Error(UNIX_KEEPER_INVALID)
    }
    closeSync(UNIX_KEEPER_STDERR_FD)
    closeSync(UNIX_PARENT_STDIN_FD)
    this.input = input
    this.statusInput = status
    input.on(UNIX_KEEPER_EVENT_ERROR, this.eof.bind(this))
    status.on(UNIX_KEEPER_EVENT_ERROR, this.failed.bind(this))
    status.on(UNIX_KEEPER_EVENT_DATA, this.status.bind(this))
    this.native.on(UNIX_KEEPER_EVENT_ERROR, this.failed.bind(this))
    this.native.on(UNIX_KEEPER_EVENT_CLOSE, this.closed.bind(this))
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
        process.stdout.once("drain", this.resumeStatus.bind(this))
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
  private receive(chunk: UnixKeeperChunk): void {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    this.input?.write(bytes)
    this.pending = Buffer.concat([this.pending, bytes])
    while (this.pending.length > 0) {
      if (this.pending[0] === SHELL_WIRE_GATE_RELEASE) {
        this.pending = this.pending.subarray(1)
      } else {
        this.stop(process.hrtime.bigint() + UNIX_NATIVE_STOP_BUDGET_NS)
        if (this.pending[0] !== UNIX_NATIVE_STOP) {
          this.input?.end()
          this.pending = Buffer.alloc(0)
        } else if (this.pending.length >= UNIX_NATIVE_STOP_BYTES) {
          this.stop(this.pending.readBigUInt64BE(1))
          this.pending = this.pending.subarray(UNIX_NATIVE_STOP_BYTES)
        } else {
          break
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
