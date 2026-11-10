import { mkdirSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

export class DistributionEnvironment {
  readonly home: string
  private readonly previousHome?: string
  private readonly previousProfile?: string

  constructor() {
    if (typeof process.env.HOME === "string") {
      this.previousHome = process.env.HOME
    }
    if (typeof process.env.USERPROFILE === "string") {
      this.previousProfile = process.env.USERPROFILE
    }
    this.home = mkdtempSync(join(tmpdir(), "synapse-config-"))
    mkdirSync(join(this.home, ".pi", "agent"), { recursive: true })
    process.env.HOME = this.home
    process.env.USERPROFILE = this.home
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
    if (typeof previous === "string") {
      process.env[name] = previous
    } else {
      delete process.env[name]
    }
  }
}
