import { readFile } from "node:fs/promises"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { PI_COMPUTER_PARAMETERS, PiComputerCommandHandler, translateComputerAction } from "#synapse/integration"
import {
  ComputerIntegrationNotices,
  type ComputerIntegrationSut,
  disposeComputerIntegration,
  executeComputerIntegration,
  makeComputerIntegrationSut,
} from "../fixtures"

async function registration(): Promise<void> {
  expect(sut.host.tool?.parameters).toBe(PI_COMPUTER_PARAMETERS)
  expect(sut.host.tool?.name).toBe("computer_use")
}

async function reading(): Promise<void> {
  expect((await executeComputerIntegration(sut, { action: "list_apps" })).content).toEqual([
    expect.objectContaining({ type: "text", text: expect.stringContaining("Editor") }),
  ])
}

async function textCapture(): Promise<void> {
  expect((await executeComputerIntegration(sut, { action: "capture" })).content).toEqual([
    expect.objectContaining({ type: "text", text: expect.stringContaining("Salvar") }),
  ])
}

async function safety(): Promise<void> {
  expect(JSON.stringify(await executeComputerIntegration(sut, { action: "key", keys: "cmd+shift+q" }))).toContain(
    "refused",
  )
  await expect(readFile(sut.log)).rejects.toThrow()
}

async function invalid(): Promise<void> {
  expect((await executeComputerIntegration(sut, { action: "type" })).isError).toBe(true)
}

async function cancelled(): Promise<void> {
  expect((await executeComputerIntegration(sut, { action: "list_apps" }, AbortSignal.abort())).isError).toBe(true)
  await expect(readFile(sut.log)).rejects.toThrow()
}

async function shutdown(): Promise<void> {
  await executeComputerIntegration(sut, { action: "list_apps" })
  const handler = sut.host.shutdown
  expect(handler).toBeTypeOf("function")
  if (!handler) {
    throw new Error("Handler ausente")
  }
  await handler()
  expect(await readFile(sut.log, "utf8")).toContain("end_session")
}

async function diagnosticCommand(): Promise<void> {
  const notices = new ComputerIntegrationNotices()
  await new PiComputerCommandHandler(sut.computer).execute("doctor", notices)
  expect(notices.messages.join()).toContain("computer-ready")
}

function coordinate(): void {
  expect(translateComputerAction({ action: "click", coordinate: [0, 10] })).toEqual({
    action: "click",
    coordinate: { x: 0, y: 10 },
  })
}

function register(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("registra esquema e ferramenta", registration)
  test("leitura devolve texto", reading)
  test("captura textual não inclui imagem", textCapture)
  test("segurança é aplicada pelo módulo", safety)
  test("argumentos incompletos são recusados", invalid)
  test("cancelamento impede chamada", cancelled)
  test("converte coordenadas", coordinate)
  test("comando diagnostica driver", diagnosticCommand)
  test("shutdown encerra driver", shutdown)
}

describe("integração computer-use", register)

let sut: ComputerIntegrationSut

async function prepare(): Promise<void> {
  sut = await makeComputerIntegrationSut()
}

async function cleanup(): Promise<void> {
  await disposeComputerIntegration(sut)
}
