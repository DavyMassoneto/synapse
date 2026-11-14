import { randomUUID } from "node:crypto"
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { join, normalize } from "node:path"
import { type ComputerPlatform } from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_ERROR_CODE_MISSING_FILE, isErrorWithCode } from "../command-execution"
import { COMPUTER_DRIVER_BINARY_FOLDERS } from "./binary-folders"
import {
  COMPUTER_DRIVER_ABSENT,
  COMPUTER_DRIVER_CURRENT_FILE,
  COMPUTER_DRIVER_ENCODING,
  COMPUTER_DRIVER_FOREIGN_SEPARATOR_PATTERN,
  COMPUTER_DRIVER_FOUND,
  COMPUTER_DRIVER_OVERRIDE_MISSING,
  COMPUTER_DRIVER_POINTER_END,
  COMPUTER_DRIVER_POINTER_MODE,
  COMPUTER_DRIVER_PORTABLE_SEPARATOR,
  COMPUTER_DRIVER_VERSION_ABSENT,
  COMPUTER_DRIVER_VERSION_COLLATOR,
  COMPUTER_DRIVER_VERSION_FOUND,
  COMPUTER_DRIVER_VERSION_PATTERN,
} from "./constants"
import { type ComputerDriverLocation, type ComputerDriverVersionResult } from "./types"

export function computerDriverBinaryPath(directory: string, platform: ComputerPlatform, version: string): string {
  return join(directory, version, ...COMPUTER_DRIVER_BINARY_FOLDERS[platform])
}

export function computerDriverCommandPath(value: string): string {
  return normalize(value.replace(COMPUTER_DRIVER_FOREIGN_SEPARATOR_PATTERN, COMPUTER_DRIVER_PORTABLE_SEPARATOR))
}

export function computerReadCurrentVersion(directory: string): ComputerDriverVersionResult {
  try {
    const version = readFileSync(join(directory, COMPUTER_DRIVER_CURRENT_FILE), COMPUTER_DRIVER_ENCODING).trim()
    if (!COMPUTER_DRIVER_VERSION_PATTERN.test(version)) {
      return { kind: COMPUTER_DRIVER_VERSION_ABSENT }
    }
    return { kind: COMPUTER_DRIVER_VERSION_FOUND, version }
  } catch (error) {
    if (error instanceof Error && isErrorWithCode(error, COMPUTER_ERROR_CODE_MISSING_FILE)) {
      return { kind: COMPUTER_DRIVER_VERSION_ABSENT }
    }
    throw error
  }
}

export function computerWriteCurrentVersion(directory: string, version: string): void {
  mkdirSync(directory, { recursive: true })
  const pointer = join(directory, `${COMPUTER_DRIVER_CURRENT_FILE}-${randomUUID()}`)
  try {
    writeFileSync(pointer, `${version}${COMPUTER_DRIVER_POINTER_END}`, { mode: COMPUTER_DRIVER_POINTER_MODE })
    renameSync(pointer, join(directory, COMPUTER_DRIVER_CURRENT_FILE))
  } finally {
    rmSync(pointer, { force: true })
  }
}

function computerInstalledVersions(directory: string): string[] {
  if (!existsSync(directory)) {
    return []
  }
  return readdirSync(directory)
    .filter((name) => COMPUTER_DRIVER_VERSION_PATTERN.test(name))
    .sort((first, second) => COMPUTER_DRIVER_VERSION_COLLATOR.compare(second, first))
}

export function computerFindInstalledVersion(directory: string): ComputerDriverVersionResult {
  const current = computerReadCurrentVersion(directory)
  if (current.kind === COMPUTER_DRIVER_VERSION_FOUND) {
    return current
  }
  const [newest] = computerInstalledVersions(directory)
  if (!newest) {
    return { kind: COMPUTER_DRIVER_VERSION_ABSENT }
  }
  return { kind: COMPUTER_DRIVER_VERSION_FOUND, version: newest }
}

export async function computerLocateDriver(
  directory: string,
  platform: ComputerPlatform,
  override?: string,
): Promise<ComputerDriverLocation> {
  if (override) {
    const command = computerDriverCommandPath(override)
    if (!existsSync(command)) {
      throw new Error(COMPUTER_DRIVER_OVERRIDE_MISSING)
    }
    return { kind: COMPUTER_DRIVER_FOUND, command }
  }
  const installed = computerFindInstalledVersion(directory)
  if (installed.kind === COMPUTER_DRIVER_VERSION_ABSENT) {
    return { kind: COMPUTER_DRIVER_ABSENT }
  }
  const binary = computerDriverBinaryPath(directory, platform, installed.version)
  if (!existsSync(binary)) {
    return { kind: COMPUTER_DRIVER_ABSENT }
  }
  return { kind: COMPUTER_DRIVER_FOUND, command: binary }
}
