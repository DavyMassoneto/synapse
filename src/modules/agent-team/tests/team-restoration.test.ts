import { describe, expect, test } from "vitest"
import { restoreRecord } from "./restore-record"
import { makeTeamSut } from "./team-scenario"

async function restoreFailure(): Promise<void> {
  const { team, sessions } = makeTeamSut()
  sessions.fail = true
  await team.restore([restoreRecord("alice")], [])
  expect(team.overview().agents[1]?.state).toBe("failed")
  expect(team.send("lead", "alice", "oi").kind).toBe("refused")
}

async function restoreInterrupted(): Promise<void> {
  const { team, sessions } = makeTeamSut()
  sessions.journal.checkpoint = { interrupted: true, pending: ["x"] }
  await team.restore([restoreRecord("alice")], [])
  expect(team.overview().agents[1]?.state).toBe("interrupted")
  expect(sessions.session.prompts).toHaveLength(0)
}

async function checkpointCount(): Promise<void> {
  const { team, sessions } = makeTeamSut()
  sessions.journal.checkpoint = { interrupted: true, pending: ["a", "b"] }
  await team.restore([restoreRecord("alice")], [])
  expect(team.overview().agents[1]?.activity).toContain("2")
}

async function invalidCheckpointDisposesRestoredSession(): Promise<void> {
  const { team, sessions } = makeTeamSut()
  sessions.journal.failLoad = true
  await team.restore([restoreRecord("alice")], [])
  expect(sessions.session.disposals).toBe(1)
  expect(team.overview().agents[1]?.state).toBe("failed")
}

function register(): void {
  test("checkpoint inválido descarta sessão restaurada uma vez", invalidCheckpointDisposesRestoredSession)
  test("falha de restauração visível", restoreFailure)
  test("restaura interrupção sem reenviar", restoreInterrupted)
  test("contagem de mensagens não confirmadas", checkpointCount)
}

describe("team-restoration", register)
