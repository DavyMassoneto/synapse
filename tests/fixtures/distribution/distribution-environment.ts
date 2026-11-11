import { mkdirSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { advisorConfigPath } from "#synapse/integration"
import { HOME_PREFIX, HOME_VARIABLE, PROFILE_VARIABLE } from "./constants"
import { type SavedVariable } from "./types"

export class DistributionEnvironment {
  readonly home: string
  readonly agentDirectory: string
  private readonly previousHome: SavedVariable
  private readonly previousProfile: SavedVariable

  constructor() {
    this.previousHome = this.saveVariable(HOME_VARIABLE)
    this.previousProfile = this.saveVariable(PROFILE_VARIABLE)
    this.home = mkdtempSync(join(tmpdir(), HOME_PREFIX))
    process.env[HOME_VARIABLE] = this.home
    process.env[PROFILE_VARIABLE] = this.home
    this.agentDirectory = dirname(advisorConfigPath())
    mkdirSync(this.agentDirectory, { recursive: true })
  }

  restore(): void {
    try {
      this.restoreVariable(HOME_VARIABLE, this.previousHome)
      this.restoreVariable(PROFILE_VARIABLE, this.previousProfile)
    } finally {
      rmSync(this.home, { recursive: true, force: true })
    }
  }

  private saveVariable(name: string): SavedVariable {
    const value = process.env[name]
    if (typeof value === "string") {
      return { kind: "set", value }
    }
    return { kind: "unset" }
  }

  private restoreVariable(name: string, saved: SavedVariable): void {
    if (saved.kind === "set") {
      process.env[name] = saved.value
    } else {
      delete process.env[name]
    }
  }
}
