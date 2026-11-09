import { mkdirSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { snapshotEnvironment } from "./environment-snapshot"
import { restoreVariable } from "./restore-variable"
import { type EnvironmentSnapshot } from "./types"

export class DistributionEnvironment {
  readonly home: string
  private readonly previous: EnvironmentSnapshot

  constructor() {
    this.previous = snapshotEnvironment()
    this.home = mkdtempSync(join(tmpdir(), "synapse-config-"))
    mkdirSync(join(this.home, ".pi", "agent"), { recursive: true })
    process.env.HOME = this.home
    process.env.USERPROFILE = this.home
  }

  restore(): void {
    try {
      restoreVariable("HOME", this.previous.home)
      restoreVariable("USERPROFILE", this.previous.profile)
    } finally {
      rmSync(this.home, { recursive: true, force: true })
    }
  }
}
