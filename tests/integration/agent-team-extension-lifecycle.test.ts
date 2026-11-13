import { describe, expect, test } from "vitest"
import { TeamMemberExtensionLifecycle } from "#synapse/integration/pi/agent-team/extension-lifecycle"
import { TeamExtensionSessionDouble } from "../fixtures"

async function closesOnce(): Promise<void> {
  const session = new TeamExtensionSessionDouble()
  const lifecycle = new TeamMemberExtensionLifecycle(session)
  await lifecycle.start()
  await lifecycle.close()
  await lifecycle.close()
  expect(session.operations).toEqual(["start", "shutdown", "dispose"])
}

async function exposesStartupFailure(): Promise<void> {
  const session = new TeamExtensionSessionDouble()
  session.startupFailure = true
  const lifecycle = new TeamMemberExtensionLifecycle(session)
  await expect(lifecycle.start()).rejects.toThrow()
  expect(session.operations).toEqual(["start", "shutdown", "dispose"])
}

async function exposesHandlerFailure(): Promise<void> {
  const session = new TeamExtensionSessionDouble()
  const lifecycle = new TeamMemberExtensionLifecycle(session)
  await lifecycle.start()
  session.reportFailure()
  expect(lifecycle.ensureHealthy.bind(lifecycle)).toThrow("Falha da extensão falsa")
}

async function disposesAfterShutdownFailure(): Promise<void> {
  const session = new TeamExtensionSessionDouble()
  const lifecycle = new TeamMemberExtensionLifecycle(session)
  await lifecycle.start()
  session.shutdownFailure = true
  await expect(lifecycle.close()).rejects.toThrow("Falha da extensão falsa")
  expect(session.operations).toEqual(["start", "shutdown", "dispose"])
}

async function waitsForShutdown(): Promise<void> {
  const session = new TeamExtensionSessionDouble()
  const lifecycle = new TeamMemberExtensionLifecycle(session)
  await lifecycle.start()
  session.held = true
  const closing = lifecycle.close()
  expect(session.operations).toEqual(["start", "shutdown"])
  session.finishShutdown()
  await closing
  expect(session.operations).toEqual(["start", "shutdown", "dispose"])
}

async function failedAttemptDoesNotDisposeSibling(): Promise<void> {
  const active = new TeamExtensionSessionDouble()
  const activeLifecycle = new TeamMemberExtensionLifecycle(active)
  await activeLifecycle.start()
  const attempted = new TeamExtensionSessionDouble()
  attempted.startupFailure = true
  const attemptedLifecycle = new TeamMemberExtensionLifecycle(attempted)
  await expect(attemptedLifecycle.start()).rejects.toThrow("Falha da extensão falsa")
  expect(attempted.operations).toEqual(["start", "shutdown", "dispose"])
  expect(active.operations).toEqual(["start"])
  await activeLifecycle.close()
}

function registerTests(): void {
  test("falha de startup descarta somente a tentativa", failedAttemptDoesNotDisposeSibling)
  test("shutdown ocorre uma vez antes de dispose", closesOnce)
  test("dispose aguarda shutdown assíncrono", waitsForShutdown)
  test("erro session_start não fica oculto", exposesStartupFailure)
  test("erro de handler não fica oculto", exposesHandlerFailure)
  test("falha no shutdown ainda descarta a sessão", disposesAfterShutdownFailure)
}

describe("lifecycle das extensões do membro", registerTests)
