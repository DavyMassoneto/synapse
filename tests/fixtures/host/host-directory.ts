import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { ADVISOR_CONFIG_FILE } from "#synapse/integration"
import { HOST_CONFIG, HOST_DIRECTORY_PREFIX } from "./constants"

export function prepareHostDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), HOST_DIRECTORY_PREFIX))
  try {
    writeFileSync(join(directory, ADVISOR_CONFIG_FILE), HOST_CONFIG)
    return directory
  } catch (error) {
    rmSync(directory, { recursive: true, force: true })
    throw error
  }
}
