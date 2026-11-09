import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

export function prepareHostDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), "synapse-host-"))
  try {
    writeFileSync(join(directory, "advisor.json"), JSON.stringify({ model: "provider/model", thinking: "low" }))
    return directory
  } catch (error) {
    rmSync(directory, { recursive: true, force: true })
    throw error
  }
}
