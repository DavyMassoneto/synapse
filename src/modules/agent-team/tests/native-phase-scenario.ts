import { execFileSync } from "node:child_process"
import { access, mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { setTimeout } from "node:timers/promises"
import {
  SHELL_PHASE_INJECTOR_SOURCE,
  SHELL_PHASE_WAIT_MS,
  SHELL_SCENARIO_CC,
  SHELL_SCENARIO_DYNAMICLIB,
  SHELL_SCENARIO_INJECTOR_DYLIB,
  SHELL_SCENARIO_NATIVE_PHASES,
  SHELL_SCENARIO_O,
  SHELL_SCENARIO_PRINTF_FORBIDDEN,
} from "./constants"
import { KeeperRuntimeScenario } from "./keeper-runtime-scenario"

export class NativePhaseScenario {
  readonly directory: string
  private constructor(directory: string) {
    this.directory = directory
  }
  static async create(): Promise<NativePhaseScenario> {
    const directory = await mkdtemp(join(tmpdir(), SHELL_SCENARIO_NATIVE_PHASES))
    execFileSync(SHELL_SCENARIO_CC, [
      SHELL_SCENARIO_DYNAMICLIB,
      join(__dirname, SHELL_PHASE_INJECTOR_SOURCE),
      SHELL_SCENARIO_O,
      join(directory, SHELL_SCENARIO_INJECTOR_DYLIB),
    ])
    return new NativePhaseScenario(directory)
  }
  async start(mode: string): Promise<KeeperRuntimeScenario> {
    return KeeperRuntimeScenario.create(SHELL_SCENARIO_PRINTF_FORBIDDEN, {
      DYLD_INSERT_LIBRARIES: join(this.directory, SHELL_SCENARIO_INJECTOR_DYLIB),
      SYNAPSE_FAULT_DIRECTORY: this.directory,
      SYNAPSE_FAULT_MODE: mode,
    })
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
