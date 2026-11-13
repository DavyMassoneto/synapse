import { describe, expect, test } from "vitest"
import { IphoneModuleService } from "#synapse/modules/iphone/internal/module-service"
import { IPHONE_LIFECYCLE_DEPENDENCIES } from "./constants"
import { LifecycleInfrastructure } from "./lifecycle-double"
import { type IphoneLifecycleResolve } from "./types"

function configBeforeSession(): void {
  const infrastructure = new LifecycleInfrastructure()
  const service = new IphoneModuleService(IPHONE_LIFECYCLE_DEPENDENCIES, infrastructure)
  expect(service.configure([{ key: "udid", value: "other" }]).kind).toBe("accepted")
  expect(infrastructure.writes).toBe(1)
}

async function configRejectedDuringSession(): Promise<void> {
  const infrastructure = new LifecycleInfrastructure()
  const service = new IphoneModuleService(IPHONE_LIFECYCLE_DEPENDENCIES, infrastructure)
  await service.execute({ kind: "screenshot" }, new AbortController().signal)
  expect(service.configure([{ key: "udid", value: "other" }]).kind).toBe("refused")
  expect(infrastructure.writes).toBe(0)
  await service.stopServer()
  expect(infrastructure.session.disposals).toBe(1)
  expect(service.configure([{ key: "udid", value: "other" }]).kind).toBe("accepted")
  await service.shutdown()
}

async function configureRejectedWhileStarting(): Promise<void> {
  const infrastructure = new LifecycleInfrastructure()
  const service = new IphoneModuleService(IPHONE_LIFECYCLE_DEPENDENCIES, infrastructure)
  const starting = service.startServer(new AbortController().signal)
  expect(service.configure([{ key: "udid", value: "other" }]).kind).toBe("refused")
  expect(infrastructure.writes).toBe(0)
  infrastructure.startRelease?.()
  await starting
  expect(service.configure([{ key: "udid", value: "other" }]).kind).toBe("refused")
  await service.stopServer()
  expect(service.configure([{ key: "udid", value: "other" }]).kind).toBe("accepted")
  await service.shutdown()
}

async function shutdownCancelsActiveOperationBeforeStartFinishes(): Promise<void> {
  const infrastructure = new LifecycleInfrastructure()
  const service = new IphoneModuleService(IPHONE_LIFECYCLE_DEPENDENCIES, infrastructure)
  const operation = service.execute({ kind: "wait", seconds: 1 }, new AbortController().signal)
  await new Promise<void>(nextTurn)
  const starting = service.startServer(new AbortController().signal)
  const closing = service.shutdown()
  expect(infrastructure.session.waitSignal?.aborted).toBe(true)
  expect(infrastructure.stops).toBe(0)
  infrastructure.session.waitRelease?.()
  await expect(operation).rejects.toThrow()
  infrastructure.startRelease?.()
  await expect(starting).rejects.toThrow()
  await closing
  expect(infrastructure.stops).toBe(1)
}

function nextTurn(resolve: IphoneLifecycleResolve): void {
  setTimeout(resolve, 0)
}

async function shutdownWaitsForStart(): Promise<void> {
  const infrastructure = new LifecycleInfrastructure()
  const service = new IphoneModuleService(IPHONE_LIFECYCLE_DEPENDENCIES, infrastructure)
  const starting = service.startServer(new AbortController().signal)
  const closing = service.shutdown()
  expect(infrastructure.startEntered).toBe(true)
  expect(infrastructure.startSignal?.aborted).toBe(true)
  expect(infrastructure.stops).toBe(0)
  infrastructure.startRelease?.()
  await expect(starting).rejects.toThrow()
  await closing
  expect(infrastructure.stops).toBe(1)
  await expect(service.startServer(new AbortController().signal)).rejects.toThrow()
}

function suite(): void {
  test("aceita configuração antes de sessão", configBeforeSession)
  test("recusa trocar alvo com sessão ativa", configRejectedDuringSession)
  test("recusa configuração durante e após início", configureRejectedWhileStarting)
  test("cancela operação antes de aguardar início", shutdownCancelsActiveOperationBeforeStartFinishes)
  test("impede início após encerramento", shutdownWaitsForStart)
}

describe("segurança do ciclo de vida", suite)
