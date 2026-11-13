import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { ADVISOR_CONFIG_FILE, advisorConfigPath } from "#synapse/integration"
import {
  AGENT_DIRECTORY_VARIABLE,
  DISTRIBUTION_AGENT_DIRECTORY,
  DISTRIBUTION_CUSTOM_AGENT_DIRECTORY,
  DISTRIBUTION_PI_DIRECTORY,
  DistributionEnvironment,
} from "../fixtures"

let environment: DistributionEnvironment

function prepare(): void {
  environment = new DistributionEnvironment()
}

function cleanup(): void {
  environment.restore()
}

function followsConfiguredAgentDirectory(): void {
  const configured = join(environment.home, DISTRIBUTION_CUSTOM_AGENT_DIRECTORY)
  process.env[AGENT_DIRECTORY_VARIABLE] = configured
  expect(advisorConfigPath()).toBe(join(configured, ADVISOR_CONFIG_FILE))
}

function usesHomeAgentDirectoryByDefault(): void {
  delete process.env[AGENT_DIRECTORY_VARIABLE]
  expect(advisorConfigPath()).toBe(
    join(environment.home, DISTRIBUTION_PI_DIRECTORY, DISTRIBUTION_AGENT_DIRECTORY, ADVISOR_CONFIG_FILE),
  )
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("a configuração do advisor fica no diretório do agente configurado no pi", followsConfiguredAgentDirectory)
  test(
    "sem diretório configurado, a configuração fica no diretório do agente da pasta do usuário",
    usesHomeAgentDirectoryByDefault,
  )
}

describe("advisor config path", registerTests)
