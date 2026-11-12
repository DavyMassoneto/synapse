import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { TEAM_EXTENSIONS_TEST_PREFIX } from "./constants"

export function createTeamExtensionsDirectory(): string {
  return mkdtempSync(join(tmpdir(), TEAM_EXTENSIONS_TEST_PREFIX))
}

export function removeTeamExtensionsDirectory(path: string): void {
  rmSync(path, { recursive: true, force: true })
}
