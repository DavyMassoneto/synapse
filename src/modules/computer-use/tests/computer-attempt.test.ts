import { describe, expect, test } from "vitest"
import { attemptComputer, COMPUTER_USE_FAILURE_MESSAGE } from "../internal"

async function successfulOperation(): Promise<string> {
  return "resultado"
}

async function errorOperation(): Promise<string> {
  throw new Error("Falha observada")
}

async function nonErrorOperation(): Promise<string> {
  return Promise.reject("valor lançado")
}

function failureResult(message: string): string {
  return `Falha: ${message}`
}

async function success(): Promise<void> {
  expect(await attemptComputer(successfulOperation, failureResult)).toBe("resultado")
}

async function error(): Promise<void> {
  expect(await attemptComputer(errorOperation, failureResult)).toBe("Falha: Falha observada")
}

async function nonError(): Promise<void> {
  expect(await attemptComputer(nonErrorOperation, failureResult)).toBe(`Falha: ${COMPUTER_USE_FAILURE_MESSAGE}`)
}

function register(): void {
  test("preserva resultado", success)
  test("converte Error pela mensagem", error)
  test("recusa valor lançado sem Error", nonError)
}

describe("tratamento único de falhas do computador", register)
