import { type ChildProcess, spawn } from "node:child_process"
import { join } from "node:path"
import { type Readable, type Writable } from "node:stream"
import { provisionUnixLauncher } from "#synapse/modules/agent-team/adapters/supervised-shell/unix"
import { type ShellWireEnvironmentEntry } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import { SHELL_KEEPER_BARRIER_ERROR, SHELL_RUNTIME_FILE, SHELL_RUNTIME_STDIO } from "./constants"
import { type NativeFixtureExitCode } from "./types"

export class KeeperRuntimeScenario {
  readonly process: ChildProcess
  readonly control: Writable
  readonly status: Readable
  readonly output: Readable
  readonly terminal: Promise<number>
  statusBytes = Buffer.alloc(0)
  private readonly exit = Promise.withResolvers<number>()
  private constructor(child: ChildProcess, control: Writable, status: Readable, output: Readable) {
    this.process = child
    this.control = control
    this.status = status
    this.output = output
    this.terminal = this.exit.promise
    status.on("data", this.recordStatus.bind(this))
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
      ["--import", "jiti/register", join(__dirname, SHELL_RUNTIME_FILE), executable],
      { detached: true, stdio: SHELL_RUNTIME_STDIO },
    )
    const control = child.stdio.at(3)
    const input = child.stdio.at(5)
    if (!control || !("write" in control) || !child.stdout || !child.stderr) {
      throw new Error(SHELL_KEEPER_BARRIER_ERROR)
    }
    const scenario = new KeeperRuntimeScenario(child, control, child.stdout, child.stderr)
    child.on("close", scenario.closed.bind(scenario))
    control.on("error", scenario.controlError.bind(scenario))
    const environment: ShellWireEnvironmentEntry[] = []
    for (const [name, value] of Object.entries(process.env)) {
      if (typeof value === "string") {
        environment.push({ name, value })
      }
    }
    if (extraEnvironment) {
      for (const [name, value] of Object.entries(extraEnvironment)) {
        if (typeof value === "string") {
          environment.push({ name, value })
        }
      }
    }
    const spec = Buffer.from(
      JSON.stringify({ executable: "/bin/bash", arguments: ["-c", command], cwd: process.cwd(), environment }),
    )
    const header = Buffer.alloc(4)
    header.writeUInt32BE(spec.length)
    control.write(Buffer.concat([header, spec]))
    if (input && "end" in input) {
      input.end()
    }
    return scenario
  }
  private recordStatus(bytes: Buffer): void {
    this.statusBytes = Buffer.concat([this.statusBytes, bytes])
  }
  private controlError(error: Error): void {
    if (!("code" in error && error.code === "EPIPE")) {
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
