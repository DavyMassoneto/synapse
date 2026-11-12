import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test } from "vitest"
import {
  readIphoneConfiguration,
  readIphoneConfigurationView,
  writeIphoneConfiguration,
} from "#synapse/modules/iphone/adapters/configuration-file"
import { withIphoneConfigDirectory } from "./configuration-support"
import { IPHONE_TEST_UTF8_BOM } from "./constants"

function missingConfiguration(directory: string): void {
  expect(readIphoneConfiguration(join(directory, "config.json")).kind).toBe("missing")
}

function validConfiguration(directory: string): void {
  const path = join(directory, "config.json")
  writeFileSync(
    path,
    JSON.stringify({
      serverUrl: "http://localhost:4723",
      target: { kind: "device", udid: "abc", deviceName: "iPhone", wdaInstalled: true },
    }),
  )
  expect(readIphoneConfiguration(path).kind).toBe("loaded")
}

function invalidConfiguration(directory: string): void {
  const path = join(directory, "config.json")
  writeFileSync(path, '{"serverUrl": 42}')
  expect(readIphoneConfiguration(path)).toMatchObject({
    kind: "invalid",
    message: expect.stringContaining("target"),
  })
}

function readsConfigurationWithBom(directory: string): void {
  const path = join(directory, "config.json")
  writeFileSync(
    path,
    `${IPHONE_TEST_UTF8_BOM}{"serverUrl":"http://localhost:4723","target":"device","udid":"abc","deviceName":"iPhone","wdaInstalled":true}`,
  )
  expect(readIphoneConfiguration(path).kind).toBe("loaded")
}

function rejectsInvalidJsonWithBom(directory: string): void {
  const path = join(directory, "config.json")
  writeFileSync(path, `${IPHONE_TEST_UTF8_BOM}{invalid`)
  expect(readIphoneConfiguration(path).kind).toBe("invalid")
}

function writesPartialConfiguration(directory: string): void {
  const path = join(directory, "config.json")
  expect(writeIphoneConfiguration(path, [{ key: "udid", value: "secret-id" }])).toEqual({ kind: "accepted" })
  expect(readFileSync(path, "utf8")).toContain('"udid": "secret-id"')
  expect(readIphoneConfiguration(path)).toMatchObject({
    kind: "invalid",
    message: expect.stringContaining("serverUrl"),
  })
}

function showsMissingFields(directory: string): void {
  const path = join(directory, "config.json")
  writeIphoneConfiguration(path, [{ key: "target", value: "device" }])
  expect(readIphoneConfigurationView(path)).toMatchObject({
    target: "device",
    missing: expect.arrayContaining(["serverUrl", "udid", "deviceName"]),
  })
}

function rejectsInvalidPortWithoutWriting(directory: string): void {
  const path = join(directory, "config.json")
  writeIphoneConfiguration(path, [{ key: "udid", value: "secret" }])
  const before = readFileSync(path, "utf8")
  expect(writeIphoneConfiguration(path, [{ key: "port", value: "99999" }]).kind).toBe("refused")
  expect(readFileSync(path, "utf8")).toBe(before)
}

function rejectsUnknownConfiguration(directory: string): void {
  const path = join(directory, "config.json")
  expect(writeIphoneConfiguration(path, [{ key: "unknown", value: "secret" }])).toMatchObject({ kind: "refused" })
  expect(existsSync(path)).toBe(false)
}

function suite(): void {
  test("lê configuração com BOM UTF-8", withIphoneConfigDirectory.bind(null, readsConfigurationWithBom))
  test("recusa JSON inválido com BOM UTF-8", withIphoneConfigDirectory.bind(null, rejectsInvalidJsonWithBom))
  test("mostra campos faltantes", withIphoneConfigDirectory.bind(null, showsMissingFields))
  test(
    "recusa porta inválida sem alterar arquivo",
    withIphoneConfigDirectory.bind(null, rejectsInvalidPortWithoutWriting),
  )
  test("grava configuração parcial", withIphoneConfigDirectory.bind(null, writesPartialConfiguration))
  test("recusa chave desconhecida", withIphoneConfigDirectory.bind(null, rejectsUnknownConfiguration))
  test("arquivo ausente", withIphoneConfigDirectory.bind(null, missingConfiguration))
  test("arquivo válido", withIphoneConfigDirectory.bind(null, validConfiguration))
  test("arquivo inválido", withIphoneConfigDirectory.bind(null, invalidConfiguration))
}

describe("arquivo de configuração iPhone", suite)
