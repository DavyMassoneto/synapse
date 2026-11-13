import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createIphone, type IphoneConfiguration } from "#synapse/modules"
import {
  IPHONE_FIXTURE_CONFIG_FILE,
  IPHONE_FIXTURE_ENCODING,
  IPHONE_FIXTURE_PREFIX,
  IPHONE_FIXTURE_STATE,
} from "./constants"
import { type IphoneIntegrationSut } from "./types"
import { IphoneFixtureServer } from "./webdriver-server"

export async function iphoneIntegrationScenario(): Promise<IphoneIntegrationSut> {
  const server = new IphoneFixtureServer()
  const serverUrl = await server.start()
  const directory = mkdtempSync(join(tmpdir(), IPHONE_FIXTURE_PREFIX))
  const config: IphoneConfiguration = {
    serverUrl,
    target: { kind: "device", udid: "explicit-fake", deviceName: "Fake", platformVersion: "26.0", wdaInstalled: true },
  }
  writeFileSync(join(directory, IPHONE_FIXTURE_CONFIG_FILE), JSON.stringify(config), IPHONE_FIXTURE_ENCODING)
  const iphone = createIphone({
    host: "linux",
    configPath: join(directory, IPHONE_FIXTURE_CONFIG_FILE),
    stateDirectory: join(directory, IPHONE_FIXTURE_STATE),
    path: directory,
    executeSimulatorCommand: noIphoneSimulators,
  })
  return { iphone, server, directory }
}

async function noIphoneSimulators() {
  return { stdout: "", stderr: "" }
}

export async function cleanupIphoneScenario(sut: IphoneIntegrationSut): Promise<void> {
  try {
    await sut.iphone.shutdown()
    await sut.server.stop()
  } finally {
    rmSync(sut.directory, { recursive: true, force: true })
  }
}
