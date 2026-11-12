import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { PI_PROCESS_SCRIPT_FILE, type PiProcessScript } from "../scripted-provider"
import {
  PI_PROCESS_AGENT_DIRECTORY,
  PI_PROCESS_PI_DIRECTORY,
  PI_PROCESS_PREFIX,
  PI_PROCESS_REMOVE_RETRIES,
  PI_PROCESS_RETRY_SETTINGS,
  PI_PROCESS_SETTINGS_FILE,
} from "./constants"

export class PiProcessHome {
  readonly home = mkdtempSync(join(tmpdir(), PI_PROCESS_PREFIX))

  readonly agentDirectory = join(this.home, PI_PROCESS_PI_DIRECTORY, PI_PROCESS_AGENT_DIRECTORY)

  constructor() {
    mkdirSync(this.agentDirectory, { recursive: true })
    writeFileSync(join(this.agentDirectory, PI_PROCESS_SETTINGS_FILE), JSON.stringify(PI_PROCESS_RETRY_SETTINGS))
    this.script([])
  }

  script(steps: PiProcessScript): void {
    writeFileSync(join(this.home, PI_PROCESS_SCRIPT_FILE), JSON.stringify(steps))
  }

  remove(): void {
    rmSync(this.home, { recursive: true, force: true, maxRetries: PI_PROCESS_REMOVE_RETRIES })
  }
}
