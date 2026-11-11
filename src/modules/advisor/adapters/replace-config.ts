import { randomUUID } from "node:crypto"
import { mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { type Config } from "#synapse/modules/advisor/public/contracts"
import {
  CONFIG_FILE_END,
  CONFIG_INDENT,
  CONFIG_WRITE_AND_CLEANUP_FAILED,
  CREATE_ONLY,
  TEMPORARY_EXTENSION,
} from "./constants"

export function replaceConfig(path: string, config: Config): void {
  mkdirSync(dirname(path), { recursive: true })
  const temporary = `${path}.${randomUUID()}${TEMPORARY_EXTENSION}`
  try {
    writeFileSync(temporary, `${JSON.stringify(config, null, CONFIG_INDENT)}${CONFIG_FILE_END}`, { flag: CREATE_ONLY })
    renameSync(temporary, path)
  } catch (error) {
    try {
      rmSync(temporary, { force: true })
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], CONFIG_WRITE_AND_CLEANUP_FAILED)
    }
    throw error
  }
}
