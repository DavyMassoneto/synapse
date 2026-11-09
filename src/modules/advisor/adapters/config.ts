import { readFileSync } from "node:fs"
import { type Config } from "#synapse/modules/advisor/public/contracts"
import { type ConfigLoadResult } from "../internal"
import { CONFIG_DIAGNOSTICS } from "./constants"
import { parseConfig } from "./parse-config"
import { replaceConfig } from "./replace-config"

export class FileConfig {
  private readonly path: string

  constructor(path: string) {
    this.path = path
  }

  load(): ConfigLoadResult {
    let content: string
    try {
      content = readFileSync(this.path, "utf8")
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return { kind: "missing" }
      }
      return { kind: "invalid", message: CONFIG_DIAGNOSTICS.readFailed }
    }
    return parseConfig(content)
  }

  save(config: Config): void {
    replaceConfig(this.path, config)
  }
}
