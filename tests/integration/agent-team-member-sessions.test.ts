import { readFileSync, rmSync, writeFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import {
  openTeamMemberStorage,
  PiTeamMemberJournal,
  TEAM_PI_MEMBER_SEED,
  TEAM_PI_MEMBER_USER_ROLE,
} from "#synapse/integration"
import {
  TEAM_SESSION_FIXTURE_HEADER_TYPE,
  TEAM_SESSION_FIXTURE_LEGACY_VERSION,
  TEAM_SESSION_FIXTURE_TEST_CHECKPOINT,
  TEAM_SESSION_FIXTURE_TEST_RECORD,
  TEAM_SESSION_FIXTURE_TIMESTAMP,
  TEAM_SESSION_FIXTURE_WRONG_ID,
  TeamStorageFixture,
  teamStorageRecord,
} from "../fixtures"

let fixture: TeamStorageFixture

function prepare(): void {
  fixture = new TeamStorageFixture()
}

function cleanup(): void {
  fixture.dispose()
}

function persistsCheckpoint(): void {
  fixture.storage.appendMessage({ role: TEAM_PI_MEMBER_USER_ROLE, content: TEAM_PI_MEMBER_SEED, timestamp: 0 })
  const journal = new PiTeamMemberJournal(fixture.storage)
  journal.save(TEAM_SESSION_FIXTURE_TEST_CHECKPOINT)
  expect(journal.load()).toEqual(TEAM_SESSION_FIXTURE_TEST_CHECKPOINT)
}

function refusesMissingJournal(): void {
  fixture.storage.appendMessage({ role: TEAM_PI_MEMBER_USER_ROLE, content: TEAM_PI_MEMBER_SEED, timestamp: 0 })
  rmSync(fixture.directory, { recursive: true, force: true })
  const journal = new PiTeamMemberJournal(fixture.storage)
  expect(journal.save.bind(journal, TEAM_SESSION_FIXTURE_TEST_CHECKPOINT)).toThrow(/ausente/)
}

function refusesMissingStorage(): void {
  const record = teamStorageRecord(fixture)
  expect(openTeamMemberStorage.bind(null, record)).toThrow(/ausente/)
}

function refusesEmptyStorage(): void {
  const record = teamStorageRecord(fixture)
  writeFileSync(record.sessionFile, "")
  expect(openTeamMemberStorage.bind(null, record)).toThrow(/vazia/)
}

function refusesMalformedStorage(): void {
  const record = teamStorageRecord(fixture)
  writeFileSync(record.sessionFile, "{broken")
  expect(openTeamMemberStorage.bind(null, record)).toThrow(/inválido/)
}

function reopensExactStorage(): void {
  fixture.storage.appendMessage({ role: TEAM_PI_MEMBER_USER_ROLE, content: TEAM_PI_MEMBER_SEED, timestamp: 0 })
  const path = fixture.sessionFile()
  const record = {
    ...TEAM_SESSION_FIXTURE_TEST_RECORD,
    cwd: fixture.cwd,
    sessionFile: path,
    sessionId: fixture.storage.getSessionId(),
  }
  const reopened = openTeamMemberStorage(record)
  expect(reopened.getSessionId()).toBe(record.sessionId)
  expect(reopened.getCwd()).toBe(record.cwd)
}

function refusesDifferentIdentity(): void {
  fixture.storage.appendMessage({ role: TEAM_PI_MEMBER_USER_ROLE, content: TEAM_PI_MEMBER_SEED, timestamp: 0 })
  const path = fixture.sessionFile()
  const record = { ...TEAM_SESSION_FIXTURE_TEST_RECORD, cwd: fixture.cwd, sessionFile: path }
  expect(openTeamMemberStorage.bind(null, record)).toThrow(/divergente/)
}

function refusesWrongIdentityWithoutMutation(): void {
  const record = teamStorageRecord(fixture)
  const content = JSON.stringify({
    type: TEAM_SESSION_FIXTURE_HEADER_TYPE,
    version: TEAM_SESSION_FIXTURE_LEGACY_VERSION,
    id: TEAM_SESSION_FIXTURE_WRONG_ID,
    cwd: record.cwd,
    timestamp: TEAM_SESSION_FIXTURE_TIMESTAMP,
  })
  writeFileSync(record.sessionFile, content)
  const before = readFileSync(record.sessionFile)
  expect(openTeamMemberStorage.bind(null, record)).toThrow(/divergente/)
  expect(readFileSync(record.sessionFile)).toEqual(before)
}

function refusesWrongCwdWithoutMutation(): void {
  const record = teamStorageRecord(fixture)
  const content = JSON.stringify({
    type: TEAM_SESSION_FIXTURE_HEADER_TYPE,
    version: TEAM_SESSION_FIXTURE_LEGACY_VERSION,
    id: record.sessionId,
    cwd: fixture.directory,
    timestamp: TEAM_SESSION_FIXTURE_TIMESTAMP,
  })
  writeFileSync(record.sessionFile, content)
  const before = readFileSync(record.sessionFile)
  expect(openTeamMemberStorage.bind(null, record)).toThrow(/divergente/)
  expect(readFileSync(record.sessionFile)).toEqual(before)
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test("id divergente em sessão antiga sem newline não altera bytes", refusesWrongIdentityWithoutMutation)
  test("cwd divergente em sessão antiga sem newline não altera bytes", refusesWrongCwdWithoutMutation)
  test("checkpoint preserva mensagens ainda não confirmadas", persistsCheckpoint)
  test("arquivo removido recusa gravação de checkpoint", refusesMissingJournal)
  test("reabre a sessão pelo caminho exato e preserva identidade", reopensExactStorage)
  test("reabertura recusa arquivo ausente", refusesMissingStorage)
  test("reabertura recusa arquivo vazio", refusesEmptyStorage)
  test("reabertura recusa arquivo malformado", refusesMalformedStorage)
  test("reabertura recusa identidade divergente", refusesDifferentIdentity)
}

describe("sessões persistentes dos membros", registerTests)
