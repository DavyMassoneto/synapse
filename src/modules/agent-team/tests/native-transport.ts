import { spawn } from "node:child_process"
import { once } from "node:events"
import { join } from "node:path"
import { type Readable, type Writable } from "node:stream"
import { provisionUnixLauncher } from "#synapse/modules/agent-team/adapters/supervised-shell/unix"
import { SHELL_KEEPER_BARRIER_ERROR, SHELL_NATIVE_FIXTURE_FILE } from "./constants"
import { type NativeFixtureExitCode, type NativeTransportProcess } from "./types"

export class NativeTransport {
  readonly control: Writable
  readonly process: NativeTransportProcess
  readonly status: Readable
  readonly output: Readable
  private readonly exit = Promise.withResolvers<number>()
  private readonly identity: Readable
  private constructor(
    child: NativeTransportProcess,
    control: Writable,
    status: Readable,
    output: Readable,
    identity: Readable,
  ) {
    this.process = child
    this.control = control
    this.status = status
    this.output = output
    this.identity = identity
    control.on("error", control.destroy.bind(control))
    child.on("close", this.onClose.bind(this))
  }
  static async create(command: string): Promise<NativeTransport> {
    const executable = await provisionUnixLauncher()
    const child = spawn(
      process.execPath,
      ["--import", "jiti/register", join(__dirname, SHELL_NATIVE_FIXTURE_FILE), executable, process.cwd(), command],
      { detached: true, stdio: ["ignore", "ignore", "pipe", "pipe", "pipe", "pipe", "ignore", "ignore", "pipe"] },
    )
    const control = child.stdio.at(3)
    const status = child.stdio.at(4)
    const input = child.stdio.at(5)
    const identity = child.stdio.at(8)
    if (
      !control ||
      !("write" in control) ||
      !status ||
      !("read" in status) ||
      !identity ||
      !("read" in identity) ||
      !child.stderr
    ) {
      throw new Error(SHELL_KEEPER_BARRIER_ERROR)
    }
    if (input && "end" in input) {
      input.end()
    }
    return new NativeTransport(child, control, status, child.stderr, identity)
  }
  async reservationPid(): Promise<number> {
    const chunks = await once(this.identity, "data")
    const text = chunks[0]
    if (!Buffer.isBuffer(text) || !/^\d+\n$/.test(text.toString())) {
      throw new Error(SHELL_KEEPER_BARRIER_ERROR)
    }
    return Number(text.toString())
  }
  release(): void {
    this.control.write(Buffer.from([1]))
  }
  stop(deadline: bigint): void {
    const frame = Buffer.alloc(9)
    frame[0] = 2
    frame.writeBigUInt64BE(deadline, 1)
    this.control.end(frame)
  }
  private onClose(code: NativeFixtureExitCode): void {
    if (typeof code === "number") {
      this.exit.resolve(code)
    } else {
      this.exit.reject(new Error(SHELL_KEEPER_BARRIER_ERROR))
    }
  }
  closed(): Promise<number> {
    return this.exit.promise
  }
  eof(): void {
    this.control.end()
  }
  killSessionKeeper(): void {
    if (!this.process.pid) {
      throw new Error(SHELL_KEEPER_BARRIER_ERROR)
    }
    process.kill(this.process.pid, "SIGKILL")
  }
  closeStatus(): void {
    this.status.destroy()
  }
  writeControl(bytes: Buffer): void {
    this.control.write(bytes)
  }
}
