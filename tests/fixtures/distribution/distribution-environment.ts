import { mkdirSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { advisorConfigPath } from "#synapse/composition"

export class DistributionEnvironment {
  readonly home: string
  private readonly previousHome?: string
  private readonly previousProfile?: string

  constructor() {
    if (process.env.HOME) {
      this.previousHome = process.env.HOME
    }
    if (process.env.USERPROFILE) {
      this.previousProfile = process.env.USERPROFILE
    }
    this.home = mkdtempSync(join(tmpdir(), "synapse-config-"))
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

  private restoreVariable(name: string, previous?: string): void {
    if (previous) {
      process.env[name] = previous
    } else {
      delete process.env[name]
    }
  }
}
