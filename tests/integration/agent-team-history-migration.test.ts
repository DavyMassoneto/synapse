import { describe, expect, test } from "vitest"
import {
  TEAM_HISTORY_ADMISSION_ENTRY,
  TEAM_HISTORY_MEMBER_ENTRY,
  TEAM_HISTORY_TASK_ENTRY,
  TEAM_PI_MEMBER_CHECKPOINT,
  TEAM_PI_MEMBER_LEGACY_CHECKPOINT,
} from "#synapse/integration/pi/agent-team"
import {
  HISTORY_MIGRATION_ADMISSION_DESCRIPTION,
  HISTORY_MIGRATION_ADMISSION_TEST,
  HISTORY_MIGRATION_ALPHA,
  HISTORY_MIGRATION_BETA,
  HISTORY_MIGRATION_CATALOG_DESCRIPTION,
  HISTORY_MIGRATION_COMPLETED,
  HISTORY_MIGRATION_DISCARDED_DESCRIPTION,
  HISTORY_MIGRATION_EXTENSION_ERROR,
  HISTORY_MIGRATION_FAILED,
  HISTORY_MIGRATION_FOREIGN_LEAD,
  HISTORY_MIGRATION_FOREIGN_NAME,
  HISTORY_MIGRATION_IDENTITY_DIAGNOSTIC,
  HISTORY_MIGRATION_IDLE,
  HISTORY_MIGRATION_IN_PROGRESS,
  HISTORY_MIGRATION_INACTIVE,
  HISTORY_MIGRATION_INTERRUPTED,
  HISTORY_MIGRATION_INVALID_ADMISSION_TEST,
  HISTORY_MIGRATION_ONE_PENDING_ACTIVITY,
  HISTORY_MIGRATION_PENDING,
  HISTORY_MIGRATION_SECOND_TASK_ID,
  HISTORY_MIGRATION_SUITE,
  HISTORY_MIGRATION_TASK,
  HISTORY_MIGRATION_TASK_PENDING,
  HISTORY_MIGRATION_THIRD_TASK_ID,
  HISTORY_MIGRATION_WRONG_IDENTITY_TEST,
  HISTORY_MIGRATION_WRONG_SESSION_ID,
  type HistoryMigrationContext,
  PI_PROCESS_TIMEOUT_MS,
  runHistoryMigrationScenario,
} from "../fixtures"

async function restoresMixedHistory(fixture: HistoryMigrationContext): Promise<void> {
  const alpha = fixture.createMember(HISTORY_MIGRATION_ALPHA)
  const beta = fixture.createMember(HISTORY_MIGRATION_BETA)
  const alphaRecord = fixture.record(HISTORY_MIGRATION_ALPHA, alpha)
  const betaRecord = fixture.record(HISTORY_MIGRATION_BETA, beta)
  alpha.appendCustomEntry(TEAM_PI_MEMBER_LEGACY_CHECKPOINT, { interrupted: true, pending: [HISTORY_MIGRATION_PENDING] })
  beta.appendCustomEntry(TEAM_PI_MEMBER_CHECKPOINT, { interrupted: false, pending: [] })
  fixture.storage.appendCustomEntry(TEAM_HISTORY_MEMBER_ENTRY, alphaRecord)
  fixture.storage.appendCustomEntry(TEAM_HISTORY_TASK_ENTRY, HISTORY_MIGRATION_TASK)
  fixture.storage.appendCustomEntry(TEAM_HISTORY_ADMISSION_ENTRY, {
    record: { ...alphaRecord, description: HISTORY_MIGRATION_ADMISSION_DESCRIPTION },
    task: {
      ...HISTORY_MIGRATION_TASK,
      revision: 2,
      status: HISTORY_MIGRATION_IN_PROGRESS,
      owner: HISTORY_MIGRATION_ALPHA,
    },
  })
  fixture.storage.appendCustomEntry(TEAM_HISTORY_ADMISSION_ENTRY, {
    record: betaRecord,
    task: {
      ...HISTORY_MIGRATION_TASK,
      id: HISTORY_MIGRATION_SECOND_TASK_ID,
      owner: HISTORY_MIGRATION_BETA,
      status: HISTORY_MIGRATION_IN_PROGRESS,
    },
  })
  fixture.storage.appendCustomEntry(TEAM_HISTORY_MEMBER_ENTRY, {
    ...betaRecord,
    description: HISTORY_MIGRATION_CATALOG_DESCRIPTION,
  })
  fixture.storage.appendCustomEntry(TEAM_HISTORY_TASK_ENTRY, {
    ...HISTORY_MIGRATION_TASK,
    id: HISTORY_MIGRATION_SECOND_TASK_ID,
    revision: 2,
    status: HISTORY_MIGRATION_COMPLETED,
    owner: HISTORY_MIGRATION_BETA,
  })
  const active = fixture.storage.appendCustomEntry(TEAM_HISTORY_ADMISSION_ENTRY, {
    record: { ...alphaRecord, leadId: HISTORY_MIGRATION_FOREIGN_LEAD, name: HISTORY_MIGRATION_FOREIGN_NAME },
    task: { ...HISTORY_MIGRATION_TASK, revision: 99, status: HISTORY_MIGRATION_COMPLETED },
  })
  fixture.storage.appendCustomEntry(TEAM_HISTORY_ADMISSION_ENTRY, {
    record: { ...alphaRecord, description: HISTORY_MIGRATION_DISCARDED_DESCRIPTION },
    task: { ...HISTORY_MIGRATION_TASK, revision: 50, status: HISTORY_MIGRATION_COMPLETED },
  })
  fixture.storage.branch(active)
  fixture.storage.appendCustomEntry(TEAM_HISTORY_TASK_ENTRY, {
    ...HISTORY_MIGRATION_TASK,
    id: HISTORY_MIGRATION_THIRD_TASK_ID,
  })
  await fixture.run()
  expect(fixture.agents()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: HISTORY_MIGRATION_ALPHA,
        description: HISTORY_MIGRATION_ADMISSION_DESCRIPTION,
        status: HISTORY_MIGRATION_INACTIVE,
        state: HISTORY_MIGRATION_INTERRUPTED,
        activity: expect.stringContaining(HISTORY_MIGRATION_ONE_PENDING_ACTIVITY),
      }),
      expect.objectContaining({
        name: HISTORY_MIGRATION_BETA,
        description: HISTORY_MIGRATION_CATALOG_DESCRIPTION,
        state: HISTORY_MIGRATION_IDLE,
      }),
    ]),
  )
  expect(fixture.agents()).not.toEqual(
    expect.arrayContaining([expect.objectContaining({ name: HISTORY_MIGRATION_FOREIGN_NAME })]),
  )
  expect(fixture.tasks()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: HISTORY_MIGRATION_TASK.id,
        revision: 2,
        status: HISTORY_MIGRATION_IN_PROGRESS,
        owner: HISTORY_MIGRATION_ALPHA,
      }),
      expect.objectContaining({
        id: HISTORY_MIGRATION_SECOND_TASK_ID,
        revision: 2,
        status: HISTORY_MIGRATION_COMPLETED,
        owner: HISTORY_MIGRATION_BETA,
      }),
      expect.objectContaining({
        id: HISTORY_MIGRATION_THIRD_TASK_ID,
        revision: 1,
        status: HISTORY_MIGRATION_TASK_PENDING,
      }),
    ]),
  )
  expect(fixture.process.received.records()).not.toEqual(
    expect.arrayContaining([expect.objectContaining({ type: HISTORY_MIGRATION_EXTENSION_ERROR })]),
  )
}

async function rejectsInvalidAdmission(fixture: HistoryMigrationContext): Promise<void> {
  const member = fixture.createMember(HISTORY_MIGRATION_ALPHA)
  const record = fixture.record(HISTORY_MIGRATION_ALPHA, member)
  fixture.storage.appendCustomEntry(TEAM_HISTORY_MEMBER_ENTRY, record)
  fixture.storage.appendCustomEntry(TEAM_HISTORY_TASK_ENTRY, HISTORY_MIGRATION_TASK)
  fixture.storage.appendCustomEntry(TEAM_HISTORY_ADMISSION_ENTRY, {
    record,
    task: { ...HISTORY_MIGRATION_TASK, revision: 0 },
  })
  const before = fixture.bytes(member)
  await fixture.run()
  expect(fixture.process.received.records()).toContainEqual(
    expect.objectContaining({ type: HISTORY_MIGRATION_EXTENSION_ERROR }),
  )
  expect(fixture.agents()).not.toEqual(
    expect.arrayContaining([expect.objectContaining({ name: HISTORY_MIGRATION_ALPHA })]),
  )
  expect(fixture.tasks()).toEqual([])
  expect(fixture.bytes(member)).toBe(before)
}

async function rejectsWrongIdentity(fixture: HistoryMigrationContext): Promise<void> {
  const member = fixture.createMember(HISTORY_MIGRATION_ALPHA)
  const record = { ...fixture.record(HISTORY_MIGRATION_ALPHA, member), sessionId: HISTORY_MIGRATION_WRONG_SESSION_ID }
  fixture.storage.appendCustomEntry(TEAM_HISTORY_ADMISSION_ENTRY, { record, task: HISTORY_MIGRATION_TASK })
  const before = fixture.bytes(member)
  await fixture.run()
  expect(fixture.agents()).toContainEqual(
    expect.objectContaining({
      name: HISTORY_MIGRATION_ALPHA,
      state: HISTORY_MIGRATION_FAILED,
      activity: expect.stringContaining(HISTORY_MIGRATION_IDENTITY_DIAGNOSTIC),
    }),
  )
  expect(fixture.bytes(member)).toBe(before)
}

function registerTests(): void {
  test(
    HISTORY_MIGRATION_ADMISSION_TEST,
    runHistoryMigrationScenario.bind(null, restoresMixedHistory),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    HISTORY_MIGRATION_INVALID_ADMISSION_TEST,
    runHistoryMigrationScenario.bind(null, rejectsInvalidAdmission),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    HISTORY_MIGRATION_WRONG_IDENTITY_TEST,
    runHistoryMigrationScenario.bind(null, rejectsWrongIdentity),
    PI_PROCESS_TIMEOUT_MS,
  )
}

describe(HISTORY_MIGRATION_SUITE, registerTests)
