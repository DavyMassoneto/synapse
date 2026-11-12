import { describe, expect, test } from "vitest"
import { TEAM_TEST_ALICE_REQUEST } from "./constants"
import { makeTeamSut, replacedAliceGeneration, startAlice } from "./team-scenario"

async function lateOpen(): Promise<void> {
  const { team, sessions } = makeTeamSut()
  sessions.held = true
  const starting = team.start(TEAM_TEST_ALICE_REQUEST)
  await team.suspend()
  sessions.releaseFirst()
  expect((await starting).kind).toBe("refused")
  expect(sessions.session.disposed).toBe(true)
}

async function suspendPrompt(): Promise<void> {
  const { team, sessions } = await startAlice()
  const stopping = team.suspend()
  expect(sessions.session.disposed).toBe(false)
  sessions.session.finishPrompt()
  await stopping
  expect(sessions.session.disposed).toBe(true)
}

async function lateCallback(): Promise<void> {
  const { team, sessions, lead } = await startAlice()
  const stopping = team.suspend()
  sessions.session.emit({ kind: "execution_settled", aborted: false, answer: "x" })
  sessions.session.finishPrompt()
  await stopping
  expect(lead.deliveries).toHaveLength(0)
}

async function suspensionJournalFailure(): Promise<void> {
  const { team, sessions, lead } = await startAlice()
  sessions.journal.failAt = 3
  const stopping = team.suspend()
  sessions.session.finishPrompt()
  await stopping
  expect(sessions.session.disposed).toBe(true)
  expect(lead.failures).toHaveLength(1)
}

async function generationIsolation(): Promise<void> {
  const { sessions, current, previousResult } = await replacedAliceGeneration()
  expect(previousResult.kind).toBe("refused")
  sessions.releaseFirst()
  await current
}

async function currentGenerationKeepsReservation(): Promise<void> {
  const { team, sessions, current } = await replacedAliceGeneration()
  expect((await team.start(TEAM_TEST_ALICE_REQUEST)).kind).toBe("refused")
  sessions.releaseFirst()
  await current
}

async function currentGenerationStarts(): Promise<void> {
  const { sessions, current } = await replacedAliceGeneration()
  sessions.releaseFirst()
  expect((await current).kind).toBe("started")
}

function register(): void {
  test("criação tardia após suspensão", lateOpen)
  test("suspensão espera preparação", suspendPrompt)
  test("suspensão impede aviso antigo", lateCallback)
  test("falha ao suspender não impede descarte", suspensionJournalFailure)
  test("isolamento de gerações", generationIsolation)
  test("nova geração preserva reserva do nome", currentGenerationKeepsReservation)
  test("nova geração inicia após descartar a anterior", currentGenerationStarts)
}

describe("team-suspension", register)
