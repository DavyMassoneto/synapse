import { readFileSync } from "node:fs"
import { type Config, type ConfigLoadResult } from "#synapse/modules/advisor/public/contracts"
import { CONFIG_ENCODING, CONFIG_READ_FAILED } from "./constants"
import { parseConfig } from "./parse-config"
import { isMissingFile } from "./predicates"
import { replaceConfig } from "./replace-config"

export class FileConfig {
  private readonly path: string

  constructor(path: string) {
    this.path = path
  }

  load(): ConfigLoadResult {
    try {
      return parseConfig(readFileSync(this.path, CONFIG_ENCODING))
    } catch (error) {
      if (error instanceof Error && isMissingFile(error)) {
        return { kind: "missing" }
      }
      return { kind: "invalid", message: CONFIG_READ_FAILED }
    }
  }

  save(config: Config): void {
    replaceConfig(this.path, config)
  }
}
