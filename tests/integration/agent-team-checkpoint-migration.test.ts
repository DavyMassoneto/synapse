import { type SessionEntry, SessionManager } from "@earendil-works/pi-coding-agent"
import { describe, expect, test } from "vitest"
import {
  PiTeamMemberJournal,
  TEAM_HISTORY_ADMISSION_ENTRY,
  TEAM_HISTORY_MEMBER_ENTRY,
  TEAM_PI_MEMBER_CHECKPOINT,
  TEAM_PI_MEMBER_LEGACY_CHECKPOINT,
} from "#synapse/integration/pi/agent-team"
import {
  HISTORY_MIGRATION_ALPHA,
  HISTORY_MIGRATION_BETA,
  HISTORY_MIGRATION_CHECKPOINT_TEST,
  HISTORY_MIGRATION_CONFIRMED,
  HISTORY_MIGRATION_CONFIRMED_ACTIVITY,
  HISTORY_MIGRATION_CURRENT_PENDING,
  HISTORY_MIGRATION_CUSTOM_ENTRY,
  HISTORY_MIGRATION_FAILED,
  HISTORY_MIGRATION_IDLE,
  HISTORY_MIGRATION_INACTIVE,
  HISTORY_MIGRATION_INTERRUPTED,
  HISTORY_MIGRATION_INVALID_CHECKPOINT_TEST,
  HISTORY_MIGRATION_LEGACY,
  HISTORY_MIGRATION_MARKER,
  HISTORY_MIGRATION_NO_CHECKPOINT_TEST,
  HISTORY_MIGRATION_PENDING,
  HISTORY_MIGRATION_SUITE,
  HISTORY_MIGRATION_TASK,
  HISTORY_MIGRATION_TWO_PENDING_ACTIVITY,
  type HistoryMigrationContext,
  PI_PROCESS_TIMEOUT_MS,
  runHistoryMigrationScenario,
} from "../fixtures"

async function restoresLastCheckpoint(fixture: HistoryMigrationContext): Promise<void> {
  const alpha = fixture.createMember(HISTORY_MIGRATION_ALPHA)
  const beta = fixture.createMember(HISTORY_MIGRATION_BETA)
  alpha.appendCustomEntry(TEAM_PI_MEMBER_LEGACY_CHECKPOINT, { interrupted: true, pending: [HISTORY_MIGRATION_PENDING] })
  alpha.appendCustomEntry(TEAM_PI_MEMBER_CHECKPOINT, { interrupted: false, pending: [] })
  beta.appendCustomEntry(TEAM_PI_MEMBER_CHECKPOINT, { interrupted: false, pending: [] })
  const active = beta.appendCustomEntry(TEAM_PI_MEMBER_LEGACY_CHECKPOINT, {
    interrupted: true,
    pending: [HISTORY_MIGRATION_PENDING, HISTORY_MIGRATION_CURRENT_PENDING],
  })
  beta.appendCustomEntry(TEAM_PI_MEMBER_CHECKPOINT, { interrupted: false, pending: [] })
  beta.branch(active)
  beta.appendCustomEntry(HISTORY_MIGRATION_MARKER, {})
  fixture.storage.appendCustomEntry(TEAM_HISTORY_MEMBER_ENTRY, fixture.record(HISTORY_MIGRATION_ALPHA, alpha))
  fixture.storage.appendCustomEntry(TEAM_HISTORY_MEMBER_ENTRY, fixture.record(HISTORY_MIGRATION_BETA, beta))
  await fixture.run()
  expect(fixture.agents()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: HISTORY_MIGRATION_ALPHA,
        state: HISTORY_MIGRATION_IDLE,
        activity: HISTORY_MIGRATION_CONFIRMED_ACTIVITY,
      }),
      expect.objectContaining({
        name: HISTORY_MIGRATION_BETA,
        state: HISTORY_MIGRATION_INTERRUPTED,
        activity: expect.stringContaining(HISTORY_MIGRATION_TWO_PENDING_ACTIVITY),
      }),
    ]),
  )
  expect(new PiTeamMemberJournal(beta).load()).toEqual({
    interrupted: true,
    pending: [HISTORY_MIGRATION_PENDING, HISTORY_MIGRATION_CURRENT_PENDING],
  })
}

async function preservesMissingCheckpoint(fixture: HistoryMigrationContext): Promise<void> {
  const legacy = fixture.createMember(HISTORY_MIGRATION_LEGACY)
  const confirmed = fixture.createMember(HISTORY_MIGRATION_CONFIRMED)
  confirmed.appendCustomEntry(TEAM_PI_MEMBER_LEGACY_CHECKPOINT, { interrupted: false, pending: [] })
  fixture.storage.appendCustomEntry(TEAM_HISTORY_ADMISSION_ENTRY, {
    record: fixture.record(HISTORY_MIGRATION_LEGACY, legacy),
    task: HISTORY_MIGRATION_TASK,
  })
  fixture.storage.appendCustomEntry(TEAM_HISTORY_MEMBER_ENTRY, fixture.record(HISTORY_MIGRATION_CONFIRMED, confirmed))
  await fixture.run()
  expect(fixture.agents()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: HISTORY_MIGRATION_LEGACY,
        state: HISTORY_MIGRATION_INTERRUPTED,
        status: HISTORY_MIGRATION_INACTIVE,
      }),
      expect.objectContaining({
        name: HISTORY_MIGRATION_CONFIRMED,
        state: HISTORY_MIGRATION_IDLE,
        status: HISTORY_MIGRATION_INACTIVE,
      }),
    ]),
  )
  expect(new PiTeamMemberJournal(legacy).load()).toEqual({ interrupted: true, pending: [] })
}

async function rejectsInvalidCheckpoint(fixture: HistoryMigrationContext): Promise<void> {
  const member = fixture.createMember(HISTORY_MIGRATION_ALPHA)
  member.appendCustomEntry(TEAM_PI_MEMBER_CHECKPOINT, { interrupted: false, pending: [] })
  member.appendCustomEntry(TEAM_PI_MEMBER_LEGACY_CHECKPOINT, { interrupted: true, pending: [42] })
  fixture.storage.appendCustomEntry(TEAM_HISTORY_ADMISSION_ENTRY, {
    record: fixture.record(HISTORY_MIGRATION_ALPHA, member),
    task: HISTORY_MIGRATION_TASK,
  })
  await fixture.run()
  expect(fixture.agents()).toContainEqual(
    expect.objectContaining({ name: HISTORY_MIGRATION_ALPHA, state: HISTORY_MIGRATION_FAILED }),
  )
  const reopened = SessionManager.open(fixture.sessionFile(member), fixture.home.home)
  const journal = new PiTeamMemberJournal(reopened)
  expect(journal.load.bind(journal)).toThrow()
  const checkpoints: SessionEntry[] = []
  for (const entry of reopened.getBranch()) {
    if (
      entry.type === HISTORY_MIGRATION_CUSTOM_ENTRY &&
      (entry.customType === TEAM_PI_MEMBER_CHECKPOINT || entry.customType === TEAM_PI_MEMBER_LEGACY_CHECKPOINT)
    ) {
      checkpoints.push(entry)
    }
  }
  expect(checkpoints).toHaveLength(2)
  expect(checkpoints.at(-1)).toMatchObject({
    customType: TEAM_PI_MEMBER_LEGACY_CHECKPOINT,
    data: { interrupted: true, pending: [42] },
  })
}

function registerTests(): void {
  test(
    HISTORY_MIGRATION_CHECKPOINT_TEST,
    runHistoryMigrationScenario.bind(null, restoresLastCheckpoint),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    HISTORY_MIGRATION_NO_CHECKPOINT_TEST,
    runHistoryMigrationScenario.bind(null, preservesMissingCheckpoint),
    PI_PROCESS_TIMEOUT_MS,
  )
  test(
    HISTORY_MIGRATION_INVALID_CHECKPOINT_TEST,
    runHistoryMigrationScenario.bind(null, rejectsInvalidCheckpoint),
    PI_PROCESS_TIMEOUT_MS,
  )
}

describe(HISTORY_MIGRATION_SUITE, registerTests)
