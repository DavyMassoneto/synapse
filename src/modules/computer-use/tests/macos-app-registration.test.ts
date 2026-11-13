import { join } from "node:path"
import { describe, expect, test } from "vitest"
import {
  COMPUTER_APP_BUNDLE_IDENTIFIER,
  COMPUTER_APP_IDENTIFIER_FIELD,
  COMPUTER_APP_MACOS_ONLY,
  COMPUTER_APP_REGISTERED,
  COMPUTER_APP_REGISTRATION_COMMAND,
  COMPUTER_APP_REGISTRATION_FLAG,
  COMPUTER_APP_REGISTRATION_REFUSED,
  COMPUTER_APP_SIGNATURE_COMMAND,
  COMPUTER_APP_SIGNATURE_VERBOSE_FLAG,
  COMPUTER_APP_TEAM_IDENTIFIER_FIELD,
  computerRegisterMacosApp,
} from "#synapse/modules/computer-use/adapters/macos-app-registration"
import { COMPUTER_DARWIN, COMPUTER_LINUX } from "#synapse/modules/computer-use/public/contracts"
import { ComputerCommandDouble } from "./macos-app-registration-support"
import { type ComputerAppRegistrationSut, type ComputerCommandTestResult } from "./macos-app-registration-types"

const APP_DIRECTORY = join("instalacao", "CuaDriver.app")

function signedOutput(teamIdentifier: string): string {
  return `Executable=CuaDriver.app/Contents/MacOS/cua-driver\n${COMPUTER_APP_IDENTIFIER_FIELD}=${COMPUTER_APP_BUNDLE_IDENTIFIER}\n${COMPUTER_APP_TEAM_IDENTIFIER_FIELD}=${teamIdentifier}\n`
}

function output(text: string): ComputerCommandTestResult {
  return { stdout: "", stderr: text }
}

function makeSut(results: ComputerCommandTestResult[]): ComputerAppRegistrationSut {
  const executor = new ComputerCommandDouble(results)
  return { appDirectory: APP_DIRECTORY, executor, commandExecutor: executor.execute.bind(executor) }
}

async function registersSignedApp(): Promise<void> {
  const sut = makeSut([output(signedOutput("4YEC26S9KF")), output("")])
  const result = await computerRegisterMacosApp({
    platform: COMPUTER_DARWIN,
    appDirectory: sut.appDirectory,
    executor: sut.commandExecutor,
  })
  expect(result).toStrictEqual({ kind: COMPUTER_APP_REGISTERED })
  expect(sut.executor.calls).toStrictEqual([
    { command: COMPUTER_APP_SIGNATURE_COMMAND, arguments: [COMPUTER_APP_SIGNATURE_VERBOSE_FLAG, sut.appDirectory] },
    { command: COMPUTER_APP_REGISTRATION_COMMAND, arguments: [COMPUTER_APP_REGISTRATION_FLAG, sut.appDirectory] },
  ])
}

async function acceptsAlternateTeam(): Promise<void> {
  const sut = makeSut([output(signedOutput("YCK386LBJ7")), output("")])
  const result = await computerRegisterMacosApp({
    platform: COMPUTER_DARWIN,
    appDirectory: sut.appDirectory,
    executor: sut.commandExecutor,
  })
  expect(result.kind).toBe(COMPUTER_APP_REGISTERED)
}

async function refusesOtherPlatform(): Promise<void> {
  const sut = makeSut([output(signedOutput("4YEC26S9KF"))])
  const result = await computerRegisterMacosApp({
    platform: COMPUTER_LINUX,
    appDirectory: sut.appDirectory,
    executor: sut.commandExecutor,
  })
  expect(result).toStrictEqual({ kind: COMPUTER_APP_REGISTRATION_REFUSED, message: COMPUTER_APP_MACOS_ONLY })
  expect(sut.executor.calls).toStrictEqual([])
}

async function refusesUnexpectedBundle(): Promise<void> {
  const sut = makeSut([
    output(`${COMPUTER_APP_IDENTIFIER_FIELD}=outro.app\n${COMPUTER_APP_TEAM_IDENTIFIER_FIELD}=4YEC26S9KF\n`),
  ])
  const result = await computerRegisterMacosApp({
    platform: COMPUTER_DARWIN,
    appDirectory: sut.appDirectory,
    executor: sut.commandExecutor,
  })
  expect(result.kind).toBe(COMPUTER_APP_REGISTRATION_REFUSED)
}

async function refusesUnexpectedTeam(): Promise<void> {
  const sut = makeSut([output(signedOutput("OUTRAEQUIPE"))])
  const result = await computerRegisterMacosApp({
    platform: COMPUTER_DARWIN,
    appDirectory: sut.appDirectory,
    executor: sut.commandExecutor,
  })
  expect(result.kind).toBe(COMPUTER_APP_REGISTRATION_REFUSED)
}

async function refusesUnsignedApp(): Promise<void> {
  const sut = makeSut([new Error("code object is not signed at all")])
  const result = await computerRegisterMacosApp({
    platform: COMPUTER_DARWIN,
    appDirectory: sut.appDirectory,
    executor: sut.commandExecutor,
  })
  expect(result.kind).toBe(COMPUTER_APP_REGISTRATION_REFUSED)
}

function registerTests(): void {
  test("registra o app com a assinatura esperada", registersSignedApp)
  test("aceita a segunda equipe de assinatura", acceptsAlternateTeam)
  test("recusa registro fora do macOS", refusesOtherPlatform)
  test("recusa bundle inesperado", refusesUnexpectedBundle)
  test("recusa equipe de assinatura inesperada", refusesUnexpectedTeam)
  test("recusa app sem assinatura", refusesUnsignedApp)
}

describe("registro do app do cua-driver no macOS", registerTests)
