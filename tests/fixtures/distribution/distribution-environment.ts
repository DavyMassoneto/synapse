import { mkdirSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { CONFIG_DIR_NAME } from "@earendil-works/pi-coding-agent"
import { advisorConfigPath } from "#synapse/composition"
import { type SavedVariable } from "./types"

export class DistributionEnvironment {
  readonly home: string
  readonly agentDirectory: string
  private readonly previousHome: SavedVariable
  private readonly previousProfile: SavedVariable

  constructor() {
    this.previousHome = this.saveVariable("HOME")
    this.previousProfile = this.saveVariable("USERPROFILE")
    this.home = mkdtempSync(join(tmpdir(), "synapse-config-"))
    this.agentDirectory = join(this.home, CONFIG_DIR_NAME, "agent")
    process.env.HOME = this.home
    process.env.USERPROFILE = this.home
    mkdirSync(dirname(advisorConfigPath()), { recursive: true })
  }

  restore(): void {
    try {
      this.restoreVariable("HOME", this.previousHome)
      this.restoreVariable("USERPROFILE", this.previousProfile)
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
