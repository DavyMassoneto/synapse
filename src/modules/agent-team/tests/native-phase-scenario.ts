import { execFileSync } from "node:child_process"
import { access, mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { setTimeout } from "node:timers/promises"
import { provisionUnixLauncher } from "#synapse/modules/agent-team/adapters/supervised-shell/unix"
import {
  SHELL_PHASE_COMPILER_COMMAND,
  SHELL_PHASE_COMPILER_OUTPUT_FLAG,
  SHELL_PHASE_DARWIN_LIBRARY_FILE,
  SHELL_PHASE_DARWIN_LIBRARY_FLAG,
  SHELL_PHASE_INJECTOR_SOURCE,
  SHELL_PHASE_LINUX_BINARY,
  SHELL_PHASE_LINUX_COMPILE_FLAGS,
  SHELL_PHASE_LINUX_WRAP,
  SHELL_PHASE_NATIVE_DIRECTORY,
  SHELL_PHASE_NATIVE_SOURCES,
  SHELL_PHASE_TEMPORARY_PREFIX,
  SHELL_PHASE_USER_COMMAND,
  SHELL_PHASE_WAIT_MS,
} from "./constants"
import { KeeperRuntimeScenario } from "./keeper-runtime-scenario"

export class NativePhaseScenario {
  readonly directory: string
  private constructor(directory: string) {
    this.directory = directory
  }
  static async create(): Promise<NativePhaseScenario> {
    const directory = await mkdtemp(join(tmpdir(), SHELL_PHASE_TEMPORARY_PREFIX))
    if (process.platform === "darwin") {
      execFileSync(SHELL_PHASE_COMPILER_COMMAND, [
        SHELL_PHASE_DARWIN_LIBRARY_FLAG,
        join(__dirname, SHELL_PHASE_INJECTOR_SOURCE),
        SHELL_PHASE_COMPILER_OUTPUT_FLAG,
        join(directory, SHELL_PHASE_DARWIN_LIBRARY_FILE),
      ])
    } else {
      const source = join(__dirname, SHELL_PHASE_NATIVE_DIRECTORY)
      const inputs = SHELL_PHASE_NATIVE_SOURCES
      const argumentsList = [...SHELL_PHASE_LINUX_COMPILE_FLAGS, source]
      for (const input of inputs) {
        argumentsList.push(join(source, input))
      }
      argumentsList.push(
        join(__dirname, SHELL_PHASE_INJECTOR_SOURCE),
        SHELL_PHASE_LINUX_WRAP,
        "-o",
        join(directory, SHELL_PHASE_LINUX_BINARY),
      )
      execFileSync(SHELL_PHASE_COMPILER_COMMAND, argumentsList)
    }
    return new NativePhaseScenario(directory)
  }
  async start(mode: string): Promise<KeeperRuntimeScenario> {
    let executable = join(this.directory, SHELL_PHASE_LINUX_BINARY)
    if (process.platform === "darwin") {
      executable = await provisionUnixLauncher()
    }
    return KeeperRuntimeScenario.create(
      SHELL_PHASE_USER_COMMAND,
      {
        DYLD_INSERT_LIBRARIES: join(this.directory, SHELL_PHASE_DARWIN_LIBRARY_FILE),
        SYNAPSE_FAULT_DIRECTORY: this.directory,
        SYNAPSE_FAULT_MODE: mode,
      },
      executable,
    )
  }
  async marker(name: string): Promise<string> {
    const path = join(this.directory, name)
    const deadline = Date.now() + SHELL_PHASE_WAIT_MS
    while (Date.now() < deadline) {
      try {
        await access(path)
        return await readFile(path, "utf8")
      } catch {
        await setTimeout(1)
      }
    }
    throw new Error(name)
  }
  async close(): Promise<void> {
    await rm(this.directory, { recursive: true, force: true })
  }
}
