import { mkdtempSync, readdirSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { COMPUTER_INSTALL_DRIVER_UNSUPPORTED, computerInstallDriver } from "../adapters"
import { COMPUTER_DARWIN, COMPUTER_LINUX } from "../public"
import {
  COMPUTER_INSTALL_DRIVER_TEST_PREFIX,
  COMPUTER_INSTALL_DRIVER_UNSUPPORTED_ARCHITECTURE,
} from "./driver-installation-support"

let directory = ""

function prepareDirectory(): void {
  directory = mkdtempSync(join(tmpdir(), COMPUTER_INSTALL_DRIVER_TEST_PREFIX))
}

async function unsupportedLinuxTarget(): Promise<void> {
  await expect(
    computerInstallDriver(directory, COMPUTER_LINUX, COMPUTER_INSTALL_DRIVER_UNSUPPORTED_ARCHITECTURE),
  ).rejects.toThrow(COMPUTER_INSTALL_DRIVER_UNSUPPORTED)
  expect(readdirSync(directory)).toStrictEqual([])
}

async function unsupportedMacosTarget(): Promise<void> {
  await expect(
    computerInstallDriver(directory, COMPUTER_DARWIN, COMPUTER_INSTALL_DRIVER_UNSUPPORTED_ARCHITECTURE),
  ).rejects.toThrow(COMPUTER_INSTALL_DRIVER_UNSUPPORTED)
}

function registerTests(): void {
  test("recusa arquitetura sem build fixado no Linux", unsupportedLinuxTarget)
  test("recusa arquitetura sem build fixado no macOS", unsupportedMacosTarget)
}

describe("instalação do cua-driver", () => {
  beforeEach(prepareDirectory)
  afterEach(() => rmSync(directory, { recursive: true, force: true }))
  registerTests()
})
