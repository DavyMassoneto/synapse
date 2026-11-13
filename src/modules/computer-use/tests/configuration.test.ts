import { describe, expect, test } from "vitest"
import { ComputerDriverSession } from "../internal"
import { ComputerResultsDriver, computerResultsResponse } from "./results"

async function configurationError(): Promise<void> {
  const driver = new ComputerResultsDriver()
  driver.responses.configuration = { kind: "driver-error", message: "refused" }
  await expect(new ComputerDriverSession(driver, "s", false).start()).rejects.toThrow("configurar")
  expect(driver.calls).toEqual(["start_session", "set_config"])
  expect(driver.stops).toBe(1)
}

async function configurationTimeout(): Promise<void> {
  const driver = new ComputerResultsDriver()
  driver.responses.configuration = { kind: "driver-timeout", message: "timed out" }
  await expect(new ComputerDriverSession(driver, "s", false).call("click", {})).rejects.toThrow("configurar")
  expect(driver.calls).toEqual(["start_session", "set_config"])
  expect(driver.stops).toBe(1)
}

async function configurationEnvelopeError(): Promise<void> {
  const driver = new ComputerResultsDriver()
  const response = computerResultsResponse()
  response.envelope.isError = true
  driver.responses.configuration = response
  await expect(new ComputerDriverSession(driver, "s", false).start()).rejects.toThrow("configurar")
  expect(driver.calls).toEqual(["start_session", "set_config"])
  expect(driver.stops).toBe(1)
}

async function cursorError(): Promise<void> {
  const driver = new ComputerResultsDriver()
  driver.responses.cursor = { kind: "driver-error", message: "refused" }
  await expect(new ComputerDriverSession(driver, "s", false).call("click", {})).rejects.toThrow("configurar")
  expect(driver.calls).toEqual(["start_session", "set_config", "set_agent_cursor_enabled"])
  expect(driver.stops).toBe(1)
}

async function cursorTimeout(): Promise<void> {
  const driver = new ComputerResultsDriver()
  driver.responses.cursor = { kind: "driver-timeout", message: "timed out" }
  await expect(new ComputerDriverSession(driver, "s", false).start()).rejects.toThrow("configurar")
  expect(driver.calls).toEqual(["start_session", "set_config", "set_agent_cursor_enabled"])
  expect(driver.stops).toBe(1)
}

async function configuredSession(): Promise<void> {
  const driver = new ComputerResultsDriver()
  const session = new ComputerDriverSession(driver, "s", false)
  await session.call("click", {})
  expect(driver.calls).toEqual(["start_session", "set_config", "set_agent_cursor_enabled", "click"])
  expect(driver.stops).toBe(0)
}

async function configurationRecovery(): Promise<void> {
  const driver = new ComputerResultsDriver()
  const session = new ComputerDriverSession(driver, "s", false)
  driver.responses.configuration = { kind: "driver-error", message: "refused" }
  await expect(session.start()).rejects.toThrow("configurar")
  driver.responses.configuration = computerResultsResponse()
  await session.call("click", {})
  expect(driver.calls).toEqual([
    "start_session",
    "set_config",
    "start_session",
    "set_config",
    "set_agent_cursor_enabled",
    "click",
  ])
}

function register(): void {
  test("recusa erro da configuração e encerra driver", configurationError)
  test("recusa timeout da configuração antes da entrada", configurationTimeout)
  test("recusa envelope de erro da configuração", configurationEnvelopeError)
  test("recusa erro do cursor antes da entrada", cursorError)
  test("recusa timeout do cursor e encerra driver", cursorTimeout)
  test("opera após configuração aceita", configuredSession)
  test("reinicializa após configuração recusada", configurationRecovery)
}

describe("configuração com portas em memória", register)
