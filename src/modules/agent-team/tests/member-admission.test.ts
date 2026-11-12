import { describe, expect, test } from "vitest"
import { TEAM_TEST_ALICE_REQUEST } from "./constants"
import { failedAliceAcceptance, failedAliceRecord, failedAliceStart, makeTeamSut, startAlice } from "./team-scenario"

async function starts(): Promise<void> {
  const { team, sessions } = makeTeamSut()
  const result = await team.start({ description: "trabalho", task: "faça" })
  expect(result.kind).toBe("started")
  expect(sessions.session.prompts).toEqual(["faça"])
}

async function invalid(): Promise<void> {
  const { team } = makeTeamSut()
  expect((await team.start({ name: "Lead", description: "x", task: "x" })).kind).toBe("refused")
}

async function reserved(): Promise<void> {
  const { team } = makeTeamSut()
  expect((await team.start({ name: "lead", description: "x", task: "x" })).kind).toBe("refused")
}

async function duplicate(): Promise<void> {
  const { team } = await startAlice()
  expect((await team.start(TEAM_TEST_ALICE_REQUEST)).kind).toBe("refused")
}

async function openFailure(): Promise<void> {
  const { team, sessions } = makeTeamSut()
  sessions.fail = true
  await team.start(TEAM_TEST_ALICE_REQUEST)
  sessions.fail = false
  expect((await team.start(TEAM_TEST_ALICE_REQUEST)).kind).toBe("started")
}

async function failedAcceptance(): Promise<void> {
  const { team, sessions } = makeTeamSut()
  sessions.journal.failAt = 1
  const result = await team.start(TEAM_TEST_ALICE_REQUEST)
  expect(result.kind).toBe("refused")
  expect(sessions.session.disposed).toBe(true)
}

async function failedRecord(): Promise<void> {
  const { team, sessions, lead } = makeTeamSut()
  lead.failRecord = true
  const result = await team.start(TEAM_TEST_ALICE_REQUEST)
  expect(result.kind).toBe("refused")
  expect(sessions.session.disposed).toBe(true)
}

async function acceptanceDoesNotRecord(): Promise<void> {
  const { lead } = await failedAliceAcceptance()
  expect(lead.records).toHaveLength(0)
}

async function acceptanceDoesNotDeliver(): Promise<void> {
  const { lead } = await failedAliceAcceptance()
  expect(lead.deliveries).toHaveLength(0)
}

async function recordFailureKeepsRosterEmpty(): Promise<void> {
  const { team } = await failedAliceRecord()
  expect(team.overview().agents).toHaveLength(1)
}

async function reusesNameAfterAcceptanceFailure(): Promise<void> {
  const { team, sessions } = makeTeamSut()
  sessions.journal.failAt = 1
  await team.start(TEAM_TEST_ALICE_REQUEST)
  sessions.journal.failAt = 0
  expect((await team.start(TEAM_TEST_ALICE_REQUEST)).kind).toBe("started")
}

async function reusesNameAfterRecordFailure(): Promise<void> {
  const { team, lead } = makeTeamSut()
  lead.failRecord = true
  await team.start(TEAM_TEST_ALICE_REQUEST)
  lead.failRecord = false
  expect((await team.start(TEAM_TEST_ALICE_REQUEST)).kind).toBe("started")
}

async function journalStart(): Promise<void> {
  const { sessions } = await failedAliceStart()
  expect(sessions.journal.checkpoint.pending).toEqual(["x"])
}

async function journalStartDoesNotPrompt(): Promise<void> {
  const { sessions } = await failedAliceStart()
  expect(sessions.session.prompts).toHaveLength(0)
}

async function journalStartCanContinue(): Promise<void> {
  const { team, sessions } = await failedAliceStart()
  team.send("lead", "alice", "segunda")
  expect(sessions.session.prompts[0]).toContain("x\n\n")
}

function register(): void {
  test("inicia membro", starts)
  test("recusa nome inválido", invalid)
  test("recusa lead como nome", reserved)
  test("recusa nome repetido", duplicate)
  test("libera reserva após falha", openFailure)
  test("falha ao aceitar tarefa preserva atomicidade", failedAcceptance)
  test("falha ao registrar preserva atomicidade", failedRecord)
  test("falha ao iniciar mantém pendente", journalStart)
  test("falha ao iniciar não chama o modelo", journalStartDoesNotPrompt)
  test("mensagem posterior retoma pendências", journalStartCanContinue)
  test("falha de aceitação libera o nome", reusesNameAfterAcceptanceFailure)
  test("falha de registro libera o nome", reusesNameAfterRecordFailure)
  test("aceitação recusada não registra membro", acceptanceDoesNotRecord)
  test("aceitação recusada não entrega aviso", acceptanceDoesNotDeliver)
  test("registro recusado não admite membro", recordFailureKeepsRosterEmpty)
}

describe("member-admission", register)
