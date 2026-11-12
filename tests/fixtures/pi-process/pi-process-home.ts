import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { SCRIPTED_PROVIDER_SCRIPT_FILE, type ScriptedProviderScript } from "../scripted-provider"
import {
  PI_PROCESS_AGENT_DIRECTORY,
  PI_PROCESS_PI_DIRECTORY,
  PI_PROCESS_PREFIX,
  PI_PROCESS_REMOVE_RETRIES,
} from "./constants"

export class PiProcessHome {
  readonly home = mkdtempSync(join(tmpdir(), PI_PROCESS_PREFIX))

  readonly agentDirectory = join(this.home, PI_PROCESS_PI_DIRECTORY, PI_PROCESS_AGENT_DIRECTORY)

  constructor() {
    mkdirSync(this.agentDirectory, { recursive: true })
    this.script([])
  }

  script(steps: ScriptedProviderScript): void {
    writeFileSync(join(this.home, SCRIPTED_PROVIDER_SCRIPT_FILE), JSON.stringify(steps))
  }

  remove(): void {
    rmSync(this.home, { recursive: true, force: true, maxRetries: PI_PROCESS_REMOVE_RETRIES })
  }
}
