import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { type IphoneConfigurationTestScenario } from "./types"

export function withIphoneConfigDirectory(scenario: IphoneConfigurationTestScenario): void {
  const directory = mkdtempSync(join(tmpdir(), "iphone-config-"))
  try {
    scenario(directory)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}
