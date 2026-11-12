import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { registerResponseRules } from "#synapse/integration"
import { RESPONSE_RULES_TEST_DIRECTORY_PREFIX, RESPONSE_RULES_TEST_FILE } from "./constants"
import { ResponseRulesTestHost } from "./host"
import { type ResponseRulesIntegrationSut } from "./types"

export function makeResponseRulesScenario(): ResponseRulesIntegrationSut {
  const directory = mkdtempSync(join(tmpdir(), RESPONSE_RULES_TEST_DIRECTORY_PREFIX))
  const path = join(directory, RESPONSE_RULES_TEST_FILE)
  const host = new ResponseRulesTestHost()
  registerResponseRules(host, path)
  return { host, directory, path }
}

export function cleanupResponseRulesScenario(sut: ResponseRulesIntegrationSut): void {
  rmSync(sut.directory, { recursive: true, force: true })
}
