import { mkdirSync, unlinkSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { ADVISOR_CONFIG_FILE } from "#synapse/integration"
import { TypedAdvisorHost } from "./host"

export class BlockedConfigHost extends TypedAdvisorHost {
  blockConfiguration(): void {
    const path = join(this.directory, ADVISOR_CONFIG_FILE)
    unlinkSync(path)
    mkdirSync(path)
    writeFileSync(join(path, "keep"), "original")
  }
}
