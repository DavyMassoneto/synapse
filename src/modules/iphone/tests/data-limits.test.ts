import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test } from "vitest"
import {
  IPHONE_CONFIG_MAX_BYTES,
  IPHONE_CONFIG_TOO_LARGE,
  readIphoneStoredConfiguration,
} from "#synapse/modules/iphone/adapters/configuration-file"
import {
  IPHONE_HTTP_MAX_RESPONSE_BYTES,
  IPHONE_HTTP_RESPONSE_TOO_LARGE,
  readIphoneHttpBody,
} from "#synapse/modules/iphone/adapters/webdriver-http"
import { withIphoneConfigDirectory } from "./configuration-support"

async function acceptsExactHttpLimit(): Promise<void> {
  const content = "x".repeat(IPHONE_HTTP_MAX_RESPONSE_BYTES)
  expect((await readIphoneHttpBody(new Response(content))).length).toBe(IPHONE_HTTP_MAX_RESPONSE_BYTES)
}

async function rejectsExcessHttpBeforeParsing(): Promise<void> {
  const content = "x".repeat(IPHONE_HTTP_MAX_RESPONSE_BYTES + 1)
  await expect(readIphoneHttpBody(new Response(content))).rejects.toThrow(IPHONE_HTTP_RESPONSE_TOO_LARGE)
}

function acceptsExactConfigLimit(directory: string): void {
  const path = join(directory, "config.json")
  writeFileSync(path, `{${" ".repeat(IPHONE_CONFIG_MAX_BYTES - 2)}}`)
  expect(readIphoneStoredConfiguration(path).kind).toBe("loaded")
}

function rejectsExcessConfigBeforeParsing(directory: string): void {
  const path = join(directory, "config.json")
  writeFileSync(path, "x".repeat(IPHONE_CONFIG_MAX_BYTES + 1))
  expect(readIphoneStoredConfiguration(path)).toMatchObject({ kind: "invalid", message: IPHONE_CONFIG_TOO_LARGE })
}

function suite(): void {
  test("aceita limite exato HTTP", acceptsExactHttpLimit)
  test("recusa excesso HTTP antes do parse", rejectsExcessHttpBeforeParsing)
  test("aceita limite exato de arquivo", withIphoneConfigDirectory.bind(null, acceptsExactConfigLimit))
  test(
    "recusa excesso de arquivo antes do parse",
    withIphoneConfigDirectory.bind(null, rejectsExcessConfigBeforeParsing),
  )
}

describe("limites de recursos", suite)
