import { describe, expect, test } from "vitest"
import {
  COMPUTER_DRIVER_TELEMETRY_DISABLED,
  COMPUTER_DRIVER_TELEMETRY_REQUEST_VARIABLE,
  COMPUTER_DRIVER_TELEMETRY_VARIABLE,
  computerFilterDriverEnvironment,
} from "#synapse/modules/computer-use/adapters"
import { type ComputerEnvironmentFilteringSut } from "./environment-filtering-support"

function makeSut(): ComputerEnvironmentFilteringSut {
  return {
    environment: {
      PATH: "/usr/bin",
      HOME: "/home/davy",
      OPENAI_API_KEY: "chave",
      GITHUB_TOKEN: "token",
      AWS_SECRET_ACCESS_KEY: "segredo",
      DB_PASSWORD: "senha",
      PI_CREDENTIALS: "credencial",
      DEPLOY_PRIVATE_KEY: "chave-privada",
    },
  }
}

function secretsRemoved(): void {
  const { environment } = makeSut()
  const filtered = computerFilterDriverEnvironment(environment)
  expect(Object.keys(filtered).sort()).toStrictEqual([COMPUTER_DRIVER_TELEMETRY_VARIABLE, "HOME", "PATH"])
}

function telemetryDisabled(): void {
  const { environment } = makeSut()
  expect(computerFilterDriverEnvironment(environment)[COMPUTER_DRIVER_TELEMETRY_VARIABLE]).toBe(
    COMPUTER_DRIVER_TELEMETRY_DISABLED,
  )
}

function telemetryKeptByEnvironment(): void {
  const { environment } = makeSut()
  const requested = { ...environment, [COMPUTER_DRIVER_TELEMETRY_REQUEST_VARIABLE]: "1" }
  expect(COMPUTER_DRIVER_TELEMETRY_VARIABLE in computerFilterDriverEnvironment(requested)).toBe(false)
}

function registerTests(): void {
  test("remove credenciais do ambiente", secretsRemoved)
  test("desliga a telemetria por padrão", telemetryDisabled)
  test("mantém a telemetria quando o ambiente pede", telemetryKeptByEnvironment)
}

describe("ambiente do processo do cua-driver", registerTests)
