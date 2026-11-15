import { spawn } from "node:child_process"
import { once } from "node:events"
import { join } from "node:path"
import { type Readable, type Writable } from "node:stream"
import { provisionUnixLauncher } from "#synapse/modules/agent-team/adapters/supervised-shell/unix"
import { SHELL_KEEPER_BARRIER_ERROR, SHELL_NATIVE_FIXTURE_FILE } from "./constants"
import {
  SHELL_TEST_EVENT_CLOSE,
  SHELL_TEST_EVENT_DATA,
  SHELL_TEST_EVENT_ERROR,
  SHELL_TEST_NODE_IMPORT,
  SHELL_TEST_NODE_REGISTER,
  SHELL_TEST_SIGNAL_KILL,
  SHELL_TRANSPORT_CONTROL_FD,
  SHELL_TRANSPORT_IDENTITY_FD,
  SHELL_TRANSPORT_INPUT_FD,
  SHELL_TRANSPORT_PID_PATTERN,
  SHELL_TRANSPORT_RELEASE_BYTE,
  SHELL_TRANSPORT_STATUS_FD,
  SHELL_TRANSPORT_STDIO,
  SHELL_TRANSPORT_STOP_BYTE,
  SHELL_TRANSPORT_STOP_BYTES,
  SHELL_TRANSPORT_STOP_DEADLINE_OFFSET,
} from "./native-fixture-constants"
import { type NativeFixtureExitCode, type NativeTransportProcess } from "./types"
import { waitFixtureClose } from "./wait-fixture-close"

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
    control.on(SHELL_TEST_EVENT_ERROR, control.destroy.bind(control))
    child.on(SHELL_TEST_EVENT_CLOSE, this.onClose.bind(this))
  }
  static async create(command: string): Promise<NativeTransport> {
    const executable = await provisionUnixLauncher()
    const child = spawn(
      process.execPath,
      [
        SHELL_TEST_NODE_IMPORT,
        SHELL_TEST_NODE_REGISTER,
        join(__dirname, SHELL_NATIVE_FIXTURE_FILE),
        executable,
        process.cwd(),
        command,
      ],
      { detached: true, stdio: SHELL_TRANSPORT_STDIO },
    )
    const control = child.stdio.at(SHELL_TRANSPORT_CONTROL_FD)
    const status = child.stdio.at(SHELL_TRANSPORT_STATUS_FD)
    const input = child.stdio.at(SHELL_TRANSPORT_INPUT_FD)
    const identity = child.stdio.at(SHELL_TRANSPORT_IDENTITY_FD)
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
    const chunks = await once(this.identity, SHELL_TEST_EVENT_DATA)
    const text = chunks[0]
    if (!Buffer.isBuffer(text) || !SHELL_TRANSPORT_PID_PATTERN.test(text.toString())) {
      throw new Error(SHELL_KEEPER_BARRIER_ERROR)
    }
    return Number(text.toString())
  }
  release(): void {
    this.control.write(Buffer.from([SHELL_TRANSPORT_RELEASE_BYTE]))
  }
  stop(deadline: bigint): void {
    const frame = Buffer.alloc(SHELL_TRANSPORT_STOP_BYTES)
    frame[0] = SHELL_TRANSPORT_STOP_BYTE
    frame.writeBigUInt64BE(deadline, SHELL_TRANSPORT_STOP_DEADLINE_OFFSET)
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
  async close(): Promise<void> {
    if (!this.control.destroyed && !this.control.writableEnded) {
      this.control.end()
    }
    await waitFixtureClose(this.exit.promise)
  }
  killSessionKeeper(): void {
    if (!this.process.pid) {
      throw new Error(SHELL_KEEPER_BARRIER_ERROR)
    }
    process.kill(this.process.pid, SHELL_TEST_SIGNAL_KILL)
  }
}
