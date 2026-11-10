import { readFileSync } from "node:fs"
import { type Config, type ConfigLoadResult } from "#synapse/modules/advisor/public/contracts"
import { CONFIG_READ_FAILED } from "./constants"
import { parseConfig } from "./parse-config"
import { replaceConfig } from "./replace-config"

export class FileConfig {
  private readonly path: string

  constructor(path: string) {
    this.path = path
  }

  load(): ConfigLoadResult {
    try {
      return parseConfig(readFileSync(this.path, "utf8"))
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return { kind: "missing" }
      }
      return { kind: "invalid", message: CONFIG_READ_FAILED }
    }
  }

  save(config: Config): void {
    replaceConfig(this.path, config)
  }
}
