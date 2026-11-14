import { describe, expect, test } from "vitest"
import { startCreatedTeamMemberSession, TeamMemberExtensionLifecycle } from "#synapse/integration"
import {
  TEAM_EXTENSION_FIXTURE_AGGREGATE_TEST,
  TEAM_EXTENSION_FIXTURE_BIND_FAILURE_TEST,
  TEAM_EXTENSION_FIXTURE_DISPOSE,
  TEAM_EXTENSION_FIXTURE_FACTORY_START_TEST,
  TEAM_EXTENSION_FIXTURE_FAILURE,
  TEAM_EXTENSION_FIXTURE_FALLBACK_CLEANUP_TEST,
  TEAM_EXTENSION_FIXTURE_FALLBACK_TEST,
  TEAM_EXTENSION_FIXTURE_SHUTDOWN,
  TEAM_EXTENSION_FIXTURE_START,
  TEAM_EXTENSION_FIXTURE_UNAVAILABLE_MODEL,
  TeamExtensionSessionDouble,
} from "../fixtures"

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

async function refusesModelFallback(): Promise<void> {
  const session = new TeamExtensionSessionDouble()
  await expect(startCreatedTeamMemberSession(session, TEAM_EXTENSION_FIXTURE_UNAVAILABLE_MODEL)).rejects.toThrow(
    TEAM_EXTENSION_FIXTURE_UNAVAILABLE_MODEL,
  )
  expect(session.operations).toEqual([TEAM_EXTENSION_FIXTURE_SHUTDOWN, TEAM_EXTENSION_FIXTURE_DISPOSE])
}

async function disposesAfterBindFailure(): Promise<void> {
  const session = new TeamExtensionSessionDouble()
  session.bindFailure = true
  const lifecycle = new TeamMemberExtensionLifecycle(session)
  await expect(lifecycle.start()).rejects.toThrow(TEAM_EXTENSION_FIXTURE_FAILURE)
  expect(session.operations).toEqual([
    TEAM_EXTENSION_FIXTURE_START,
    TEAM_EXTENSION_FIXTURE_SHUTDOWN,
    TEAM_EXTENSION_FIXTURE_DISPOSE,
  ])
}

async function preservesStartupAndCleanupErrors(): Promise<void> {
  const session = new TeamExtensionSessionDouble()
  session.startupFailure = true
  session.shutdownFailure = true
  const lifecycle = new TeamMemberExtensionLifecycle(session)
  const starting = lifecycle.start()
  await expect(starting).rejects.toBeInstanceOf(AggregateError)
  await expect(starting).rejects.toMatchObject({
    errors: [expect.any(Error), expect.any(Error)],
  })
  await expect(starting).rejects.toMatchObject({
    errors: [{ constructor: Error }, { constructor: Error }],
  })
  expect(session.operations).toEqual([
    TEAM_EXTENSION_FIXTURE_START,
    TEAM_EXTENSION_FIXTURE_SHUTDOWN,
    TEAM_EXTENSION_FIXTURE_DISPOSE,
  ])
}

async function factoryStartsWithoutFallback(): Promise<void> {
  const session = new TeamExtensionSessionDouble()
  const lifecycle = await startCreatedTeamMemberSession(session)
  expect(session.operations).toEqual([TEAM_EXTENSION_FIXTURE_START])
  await lifecycle.close()
  expect(session.operations).toEqual([
    TEAM_EXTENSION_FIXTURE_START,
    TEAM_EXTENSION_FIXTURE_SHUTDOWN,
    TEAM_EXTENSION_FIXTURE_DISPOSE,
  ])
}

async function preservesFallbackAndCleanupFailure(): Promise<void> {
  const session = new TeamExtensionSessionDouble()
  session.disposeFailure = true
  const starting = startCreatedTeamMemberSession(session, TEAM_EXTENSION_FIXTURE_UNAVAILABLE_MODEL)
  await expect(starting).rejects.toBeInstanceOf(AggregateError)
  await expect(starting).rejects.toMatchObject({
    errors: [
      { constructor: Error, message: TEAM_EXTENSION_FIXTURE_UNAVAILABLE_MODEL },
      { constructor: Error, message: TEAM_EXTENSION_FIXTURE_FAILURE },
    ],
  })
  expect(session.operations).toEqual([TEAM_EXTENSION_FIXTURE_SHUTDOWN, TEAM_EXTENSION_FIXTURE_DISPOSE])
}

function registerTests(): void {
  test(TEAM_EXTENSION_FIXTURE_FACTORY_START_TEST, factoryStartsWithoutFallback)
  test(TEAM_EXTENSION_FIXTURE_FALLBACK_CLEANUP_TEST, preservesFallbackAndCleanupFailure)
  test(TEAM_EXTENSION_FIXTURE_FALLBACK_TEST, refusesModelFallback)
  test(TEAM_EXTENSION_FIXTURE_BIND_FAILURE_TEST, disposesAfterBindFailure)
  test(TEAM_EXTENSION_FIXTURE_AGGREGATE_TEST, preservesStartupAndCleanupErrors)
  test("falha de startup descarta somente a tentativa", failedAttemptDoesNotDisposeSibling)
  test("shutdown ocorre uma vez antes de dispose", closesOnce)
  test("dispose aguarda shutdown assíncrono", waitsForShutdown)
  test("erro session_start não fica oculto", exposesStartupFailure)
  test("erro de handler não fica oculto", exposesHandlerFailure)
  test("falha no shutdown ainda descarta a sessão", disposesAfterShutdownFailure)
}

describe("lifecycle das extensões do membro", registerTests)
