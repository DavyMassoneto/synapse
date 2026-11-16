import { access, mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { setTimeout } from "node:timers/promises"
import { provisionUnixLauncher } from "#synapse/modules/agent-team/adapters/supervised-shell/unix"
import { buildPhaseInjector } from "./build-phase-injector"
import {
  SHELL_PHASE_DARWIN_LIBRARY_FILE,
  SHELL_PHASE_LINUX_BINARY,
  SHELL_PHASE_TEMPORARY_PREFIX,
  SHELL_PHASE_USER_COMMAND,
  SHELL_PHASE_WAIT_MS,
} from "./constants"
import { KeeperRuntimeScenario } from "./keeper-runtime-scenario"
import {
  SHELL_PHASE_MARKER_POLL_MS,
  SHELL_PHASE_TEXT_ENCODING,
  SHELL_TEST_DARWIN_PLATFORM,
} from "./native-scenario-constants"

export class NativePhaseScenario {
  readonly directory: string
  private constructor(directory: string) {
    this.directory = directory
  }
  static async create(): Promise<NativePhaseScenario> {
    const directory = await mkdtemp(join(tmpdir(), SHELL_PHASE_TEMPORARY_PREFIX))
    try {
      buildPhaseInjector(directory)
      return new NativePhaseScenario(directory)
    } catch (error) {
      await rm(directory, { recursive: true, force: true })
      throw error
    }
  }
  async start(mode: string): Promise<KeeperRuntimeScenario> {
    let executable = join(this.directory, SHELL_PHASE_LINUX_BINARY)
    if (process.platform === SHELL_TEST_DARWIN_PLATFORM) {
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
        return await readFile(path, SHELL_PHASE_TEXT_ENCODING)
      } catch {
        await setTimeout(SHELL_PHASE_MARKER_POLL_MS)
      }
    }
    throw new Error(name)
  }
  async close(): Promise<void> {
    await rm(this.directory, { recursive: true, force: true })
  }
}
