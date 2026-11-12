import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { computerUseDependenciesAt, PI_COMPUTER_DRIVER_CONFIGURATION_FILE } from "#synapse/integration"
import { COMPUTER_CONFIGURATION_UTF8_BOM, COMPUTER_DEPENDENCIES_PREFIX } from "../fixtures"

async function missing(): Promise<void> {
  expect(computerUseDependenciesAt(directory, "linux", {}).driverLaunch).toBeUndefined()
}

async function configured(): Promise<void> {
  await writeFile(
    join(directory, PI_COMPUTER_DRIVER_CONFIGURATION_FILE),
    JSON.stringify({ command: process.execPath, arguments: ["fake.mjs"] }),
  )
  expect(computerUseDependenciesAt(directory, "win32", {}).driverLaunch).toMatchObject({
    command: process.execPath,
    arguments: ["fake.mjs"],
    windowsHide: true,
  })
}

async function invalid(): Promise<void> {
  await writeFile(
    join(directory, PI_COMPUTER_DRIVER_CONFIGURATION_FILE),
    JSON.stringify({ command: "", arguments: [] }),
  )
  expect(computerUseDependenciesAt.bind(undefined, directory, "linux", {})).toThrow()
}

async function configuredWithBom(): Promise<void> {
  await writeFile(
    join(directory, PI_COMPUTER_DRIVER_CONFIGURATION_FILE),
    COMPUTER_CONFIGURATION_UTF8_BOM + JSON.stringify({ command: process.execPath, arguments: ["fake.mjs"] }),
  )
  expect(computerUseDependenciesAt(directory, "win32", {}).driverLaunch).toMatchObject({
    command: process.execPath,
    arguments: ["fake.mjs"],
  })
}

async function malformedWithBom(): Promise<void> {
  await writeFile(join(directory, PI_COMPUTER_DRIVER_CONFIGURATION_FILE), `${COMPUTER_CONFIGURATION_UTF8_BOM}{broken`)
  expect(computerUseDependenciesAt.bind(undefined, directory, "win32", {})).toThrow()
}

function register(): void {
  test("configuração com BOM é lida", configuredWithBom)
  test("BOM não oculta JSON inválido", malformedWithBom)
  beforeEach(prepare)
  afterEach(cleanup)
  test("ausência preserva localização normal", missing)
  test("configuração substitui lançamento", configured)
  test("configuração inválida não é ignorada", invalid)
}

describe("dependências do computador no host", register)

let directory: string

async function prepare(): Promise<void> {
  directory = await mkdtemp(join(tmpdir(), COMPUTER_DEPENDENCIES_PREFIX))
}

async function cleanup(): Promise<void> {
  await rm(directory, { recursive: true, force: true })
}
