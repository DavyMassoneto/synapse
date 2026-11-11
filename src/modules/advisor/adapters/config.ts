import { randomUUID } from "node:crypto"
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { type Config, type ConfigLoadResult } from "#synapse/modules/advisor/public/contracts"
import {
  CONFIG_ENCODING,
  CONFIG_FILE_END,
  CONFIG_INDENT,
  CONFIG_READ_FAILED,
  CONFIG_WRITE_AND_CLEANUP_FAILED,
  CREATE_ONLY,
  TEMPORARY_EXTENSION,
} from "./constants"
import { parseConfig } from "./parse-config"
import { isMissingFile } from "./predicates"

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
    mkdirSync(dirname(this.path), { recursive: true })
    const temporary = `${this.path}.${randomUUID()}${TEMPORARY_EXTENSION}`
    try {
      writeFileSync(temporary, `${JSON.stringify(config, null, CONFIG_INDENT)}${CONFIG_FILE_END}`, {
        flag: CREATE_ONLY,
      })
      renameSync(temporary, this.path)
    } catch (error) {
      try {
        rmSync(temporary, { force: true })
      } catch (cleanupError) {
        throw new AggregateError([error, cleanupError], CONFIG_WRITE_AND_CLEANUP_FAILED)
      }
      throw error
    }
  }
}
