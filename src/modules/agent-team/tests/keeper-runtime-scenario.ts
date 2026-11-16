import { type ChildProcess, spawn } from "node:child_process"
import { join } from "node:path"
import { type Readable, type Writable } from "node:stream"
import { provisionUnixLauncher } from "#synapse/modules/agent-team/adapters/supervised-shell/unix"
import { SHELL_KEEPER_BARRIER_ERROR, SHELL_RUNTIME_FILE, SHELL_RUNTIME_STDIO } from "./constants"
import { keeperSpecFrame } from "./keeper-spec-frame"
import {
  SHELL_RUNTIME_CONTROL_FD,
  SHELL_RUNTIME_INPUT_FD,
  SHELL_TEST_EVENT_CLOSE,
  SHELL_TEST_EVENT_DATA,
  SHELL_TEST_EVENT_ERROR,
  SHELL_TEST_NODE_IMPORT,
  SHELL_TEST_NODE_REGISTER,
  SHELL_TEST_PIPE_ERROR,
} from "./native-fixture-constants"
import { type NativeFixtureExitCode } from "./types"
import { waitFixtureClose } from "./wait-fixture-close"

export class KeeperRuntimeScenario {
  readonly process: ChildProcess
  readonly control: Writable
  readonly status: Readable
  readonly output: Readable
  readonly terminal: Promise<number>
  private readonly statusChunks: Buffer[] = []
  get statusBytes(): Buffer {
    return Buffer.concat(this.statusChunks)
  }
  private readonly exit = Promise.withResolvers<number>()
  private constructor(child: ChildProcess, control: Writable, status: Readable, output: Readable) {
    this.process = child
    this.control = control
    this.status = status
    this.output = output
    this.terminal = this.exit.promise
    status.on(SHELL_TEST_EVENT_DATA, this.recordStatus.bind(this))
  }
  static async create(
    command: string,
    extraEnvironment?: NodeJS.ProcessEnv,
    launcherExecutable?: string,
  ): Promise<KeeperRuntimeScenario> {
    let executable = launcherExecutable
    if (!executable) {
      executable = await provisionUnixLauncher()
    }
    const child = spawn(
      process.execPath,
      [SHELL_TEST_NODE_IMPORT, SHELL_TEST_NODE_REGISTER, join(__dirname, SHELL_RUNTIME_FILE), executable],
      { detached: true, stdio: SHELL_RUNTIME_STDIO },
    )
    const control = child.stdio.at(SHELL_RUNTIME_CONTROL_FD)
    const input = child.stdio.at(SHELL_RUNTIME_INPUT_FD)
    if (!control || !("write" in control) || !child.stdout || !child.stderr) {
      throw new Error(SHELL_KEEPER_BARRIER_ERROR)
    }
    const scenario = new KeeperRuntimeScenario(child, control, child.stdout, child.stderr)
    child.on(SHELL_TEST_EVENT_CLOSE, scenario.closed.bind(scenario))
    control.on(SHELL_TEST_EVENT_ERROR, scenario.controlError.bind(scenario))
    control.write(keeperSpecFrame(command, extraEnvironment))
    if (input && "end" in input) {
      input.end()
    }
    return scenario
  }
  async close(): Promise<void> {
    if (!this.control.destroyed && !this.control.writableEnded) {
      this.control.end()
    }
    await waitFixtureClose(this.terminal)
  }
  private recordStatus(bytes: Buffer): void {
    this.statusChunks.push(bytes)
  }
  private controlError(error: Error): void {
    if (!("code" in error && error.code === SHELL_TEST_PIPE_ERROR)) {
      this.exit.reject(error)
    }
  }
  private closed(code: NativeFixtureExitCode): void {
    if (typeof code === "number") {
      this.exit.resolve(code)
    } else {
      this.exit.reject(new Error(SHELL_KEEPER_BARRIER_ERROR))
    }
  }
}
