import { mkdirSync, unlinkSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { TypedAdvisorHost } from "./host"

export class BlockedConfigHost extends TypedAdvisorHost {
  blockConfiguration(): void {
    const path = join(this.directory, "advisor.json")
    unlinkSync(path)
    mkdirSync(path)
    writeFileSync(join(path, "keep"), "original")
  }
}
