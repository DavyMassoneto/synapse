import { mkdtempSync, rmSync } from "node:fs"
import { join } from "node:path"
import { type IphoneConfigurationTestScenario } from "./types"

export function withIphoneConfigDirectory(scenario: IphoneConfigurationTestScenario): void {
  const directory = mkdtempSync(join(process.cwd(), ".test-iphone-config-"))
  try {
    scenario(directory)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}
