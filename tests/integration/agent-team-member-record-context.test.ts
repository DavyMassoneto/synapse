import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { type ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { describe, expect, test } from "vitest"
import { createPiTeamLeadSession, memberTools, PiTeamMemberSessions } from "#synapse/integration"
import {
  fixtureModel,
  TEAM_SESSION_FIXTURE_CONTEXT_WINDOW,
  TEAM_SESSION_FIXTURE_ENCODING,
  TEAM_SESSION_FIXTURE_INVALID_MODEL,
  TEAM_SESSION_FIXTURE_LEGACY_BYTES,
  TEAM_SESSION_FIXTURE_LEGACY_FILE,
  TEAM_SESSION_FIXTURE_MEMBERSHIP_SUITE,
  TEAM_SESSION_FIXTURE_MODEL,
  TEAM_SESSION_FIXTURE_OTHER_CWD_TEST,
  TEAM_SESSION_FIXTURE_OTHER_LEAD,
  TEAM_SESSION_FIXTURE_OTHER_LEAD_PATTERN,
  TEAM_SESSION_FIXTURE_OTHER_LEAD_TEST,
  TEAM_SESSION_FIXTURE_OTHER_WORKSPACE,
  TEAM_SESSION_FIXTURE_PROVIDER,
  TEAM_SESSION_FIXTURE_TEST_RECORD,
  TeamLeadContext,
  TeamLeadHost,
  TeamStorageFixture,
  ToolsTeamDouble,
} from "../fixtures"

function memberExtension(_pi: ExtensionAPI): void {}

function makeSut(): PiTeamMemberSessions {
  const lead = createPiTeamLeadSession(new TeamLeadHost())
  lead.attach(
    new TeamLeadContext(
      fixtureModel(TEAM_SESSION_FIXTURE_PROVIDER, TEAM_SESSION_FIXTURE_MODEL, TEAM_SESSION_FIXTURE_CONTEXT_WINDOW),
    ),
  )
  return new PiTeamMemberSessions({ context: lead.context.bind(lead), extension: memberExtension, tools: memberTools })
}

async function refusesOtherLeadBeforeReadingSession(): Promise<void> {
  const sut = makeSut()
  const storage = new TeamStorageFixture()
  const path = join(storage.directory, TEAM_SESSION_FIXTURE_LEGACY_FILE)
  try {
    writeFileSync(path, TEAM_SESSION_FIXTURE_LEGACY_BYTES)
    const record = {
      ...TEAM_SESSION_FIXTURE_TEST_RECORD,
      leadId: TEAM_SESSION_FIXTURE_OTHER_LEAD,
      model: TEAM_SESSION_FIXTURE_INVALID_MODEL,
      sessionFile: path,
    }
    await expect(sut.reopen(record, new ToolsTeamDouble())).rejects.toThrow(TEAM_SESSION_FIXTURE_OTHER_LEAD_PATTERN)
    expect(readFileSync(path, TEAM_SESSION_FIXTURE_ENCODING)).toBe(TEAM_SESSION_FIXTURE_LEGACY_BYTES)
  } finally {
    storage.dispose()
  }
}

async function refusesOtherCwdBeforeReadingSession(): Promise<void> {
  const sut = makeSut()
  const storage = new TeamStorageFixture()
  const path = join(storage.directory, TEAM_SESSION_FIXTURE_LEGACY_FILE)
  try {
    writeFileSync(path, TEAM_SESSION_FIXTURE_LEGACY_BYTES)
    const record = {
      ...TEAM_SESSION_FIXTURE_TEST_RECORD,
      cwd: TEAM_SESSION_FIXTURE_OTHER_WORKSPACE,
      model: TEAM_SESSION_FIXTURE_INVALID_MODEL,
      sessionFile: path,
    }
    await expect(sut.reopen(record, new ToolsTeamDouble())).rejects.toThrow(TEAM_SESSION_FIXTURE_OTHER_LEAD_PATTERN)
    expect(readFileSync(path, TEAM_SESSION_FIXTURE_ENCODING)).toBe(TEAM_SESSION_FIXTURE_LEGACY_BYTES)
  } finally {
    storage.dispose()
  }
}

function registerTests(): void {
  test(TEAM_SESSION_FIXTURE_OTHER_LEAD_TEST, refusesOtherLeadBeforeReadingSession)
  test(TEAM_SESSION_FIXTURE_OTHER_CWD_TEST, refusesOtherCwdBeforeReadingSession)
}

describe(TEAM_SESSION_FIXTURE_MEMBERSHIP_SUITE, registerTests)
