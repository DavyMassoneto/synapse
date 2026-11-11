import { randomUUID } from "node:crypto"
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { type Config, type ConfigLoadResult, type ConfigSaveResult } from "#synapse/modules/advisor/public/contracts"
import {
  CONFIG_ENCODING,
  CONFIG_FILE_END,
  CONFIG_INDENT,
  CONFIG_READ_FAILED,
  CREATE_ONLY,
  TEMPORARY_EXTENSION,
} from "./constants"
import { failureAfterCleanup } from "./failure-after-cleanup"
import { parseConfig } from "./parse-config"
import { isMissingFile } from "./predicates"

export class FileConfig {
  private readonly $path: string

  constructor(path: string) {
    this.$path = path
  }

  load(): ConfigLoadResult {
    try {
      return parseConfig(readFileSync(this.$path, CONFIG_ENCODING))
    } catch (error) {
      if (error instanceof Error && isMissingFile(error)) {
        return { kind: "missing" }
      }
      return { kind: "invalid", message: CONFIG_READ_FAILED }
    }
  }

  save(config: Config): ConfigSaveResult {
    const temporary = `${this.$path}.${randomUUID()}${TEMPORARY_EXTENSION}`
    try {
      mkdirSync(dirname(this.$path), { recursive: true })
      writeFileSync(temporary, `${JSON.stringify(config, null, CONFIG_INDENT)}${CONFIG_FILE_END}`, {
        flag: CREATE_ONLY,
      })
      renameSync(temporary, this.$path)
      return { kind: "saved" }
    } catch (error) {
      if (error instanceof Error) {
        return failureAfterCleanup(temporary, error)
      }
      throw error
    }
  }
}
