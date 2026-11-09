import { randomUUID } from "node:crypto"
import { mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { type Config } from "#synapse/modules/advisor/public/contracts"
import { CONFIG_DIAGNOSTICS } from "./constants"

export function replaceConfig(path: string, config: Config): void {
  mkdirSync(dirname(path), { recursive: true })
  const temporary = `${path}.${randomUUID()}.tmp`
  try {
    writeFileSync(temporary, `${JSON.stringify(config, null, 2)}\n`, { flag: "wx" })
    renameSync(temporary, path)
  } catch (error) {
    try {
      rmSync(temporary, { force: true })
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], CONFIG_DIAGNOSTICS.writeAndCleanupFailed)
    }
    throw error
  }
}
