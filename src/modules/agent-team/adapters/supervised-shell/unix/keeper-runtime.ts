import { spawn } from "node:child_process"
import { createReadStream } from "node:fs"
import { constants as osConstants } from "node:os"
import {
  SHELL_WIRE_CREATED_BYTE,
  SHELL_WIRE_ERROR_BYTE,
  SHELL_WIRE_ERROR_HEADER_BYTES,
  SHELL_WIRE_ERROR_MAX_BYTES,
  SHELL_WIRE_EXITED,
  SHELL_WIRE_STATUS_BYTES,
  type ShellWireSpec,
  WIRE_BYTE_COUNT_OFFSET,
} from "../wire"
import {
  UNIX_KEEPER_CONTROL_FD,
  UNIX_KEEPER_INTERVAL_MS,
  UNIX_KEEPER_KILL,
  UNIX_KEEPER_SIGHUP,
  UNIX_KEEPER_SIGNAL_OFFSET,
  UNIX_KEEPER_SIGTERM,
} from "./constants"
import { type UnixShellExitSignal, type UnixShellExitStatus } from "./types"

export class UnixKeeper {
  private readonly spec: ShellWireSpec
  private exitCode = 1
  private reported = false

  constructor(spec: ShellWireSpec) {
    this.spec = spec
  }

  announce(): void {
    process.stdout.write(Buffer.from([SHELL_WIRE_CREATED_BYTE]))
    process.on(UNIX_KEEPER_SIGTERM, this.stop.bind(this))
    process.on(UNIX_KEEPER_SIGHUP, this.stop.bind(this))
  }

  release(): void {
    const environment: NodeJS.ProcessEnv = {}
    for (const entry of this.spec.environment) {
      environment[entry.name] = entry.value
    }
    const child = spawn(this.spec.executable, this.spec.arguments, {
      cwd: this.spec.cwd,
      env: environment,
      detached: false,
      stdio: [this.spec.input ? "pipe" : "ignore", 2, 2],
    })
    if (this.spec.input) {
      child.stdin?.end(this.spec.input)
    }
    child.on("error", this.failed.bind(this))
    child.on("exit", this.shellExited.bind(this))
    const ownership = createReadStream("", { fd: UNIX_KEEPER_CONTROL_FD, autoClose: false })
    ownership.on("end", this.stop.bind(this))
    ownership.on("error", this.stop.bind(this))
    ownership.resume()
    setInterval(this.anchor.bind(this), UNIX_KEEPER_INTERVAL_MS)
  }

  private anchor(): void {
    process.stdin.read(0)
  }
  private stop(): void {
    process.kill(-process.pid, UNIX_KEEPER_KILL)
  }
  private shellExited(code: UnixShellExitStatus, signal: UnixShellExitSignal): void {
    if (typeof code === "number") {
      this.exitCode = code
    } else {
      this.exitCode = signal ? UNIX_KEEPER_SIGNAL_OFFSET + osConstants.signals[signal] : 1
    }
    this.reportExit()
  }
  private failed(error: Error): void {
    const text = Buffer.from(error.message)
    const bytes = text.subarray(0, SHELL_WIRE_ERROR_MAX_BYTES)
    const header = Buffer.alloc(SHELL_WIRE_ERROR_HEADER_BYTES)
    header[0] = SHELL_WIRE_ERROR_BYTE
    header.writeUInt16BE(bytes.length, 1)
    process.stdout.write(header)
    process.stdout.write(bytes)
  }
  private reportExit(): void {
    if (!this.reported) {
      this.reported = true
      const status = Buffer.alloc(SHELL_WIRE_STATUS_BYTES)
      status[0] = SHELL_WIRE_EXITED
      status.writeInt32BE(this.exitCode, 1)
      status.writeUInt32BE(0, WIRE_BYTE_COUNT_OFFSET)
      process.stdout.write(status)
    }
  }
}
