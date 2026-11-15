import { randomUUID } from "node:crypto"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { COMPUTER_CONFIGURATION_TEST_ROOT } from "./constants"

export function createComputerConfigurationDirectory(): string {
  const directory = resolve(COMPUTER_CONFIGURATION_TEST_ROOT, randomUUID())
  mkdirSync(directory, { recursive: true })
  return directory
}

export function removeComputerConfigurationDirectory(directory: string): void {
  rmSync(directory, { recursive: true, force: true })
}

export function writeComputerConfigurationFile(directory: string, file: string, content: string): void {
  writeFileSync(join(directory, file), content)
}
