import { writeFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { validateTeamSessionFile } from "#synapse/integration"
import {
  TEAM_SESSION_FIXTURE_BLANK_LINES,
  TEAM_SESSION_FIXTURE_BLANK_LINES_TEST,
  TEAM_SESSION_FIXTURE_DIVERGENT_PATTERN,
  TEAM_SESSION_FIXTURE_FINAL_WHITESPACE,
  TEAM_SESSION_FIXTURE_HEADER_TYPE,
  TEAM_SESSION_FIXTURE_IDENTITY_TEST,
  TEAM_SESSION_FIXTURE_INTERIOR_WHITESPACE,
  TEAM_SESSION_FIXTURE_INTERIOR_WHITESPACE_TEST,
  TEAM_SESSION_FIXTURE_INVALID_PATTERN,
  TEAM_SESSION_FIXTURE_MALFORMED_ENTRY,
  TEAM_SESSION_FIXTURE_MALFORMED_TEST,
  TEAM_SESSION_FIXTURE_MESSAGE_TYPE,
  TEAM_SESSION_FIXTURE_NEWLINE,
  TEAM_SESSION_FIXTURE_OTHER_ID,
  TEAM_SESSION_FIXTURE_VALIDATION_SUITE,
  TEAM_SESSION_FIXTURE_ZERO_WIDTH_END,
  TEAM_SESSION_FIXTURE_ZERO_WIDTH_TEST,
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

function rejectsWhitespaceOnlyInteriorLine(): void {
  const record = teamStorageRecord(fixture)
  const header = JSON.stringify({ type: TEAM_SESSION_FIXTURE_HEADER_TYPE, id: record.sessionId, cwd: record.cwd })
  const content = `${header}${TEAM_SESSION_FIXTURE_INTERIOR_WHITESPACE}${JSON.stringify({ type: TEAM_SESSION_FIXTURE_MESSAGE_TYPE })}${TEAM_SESSION_FIXTURE_NEWLINE}`
  writeFileSync(record.sessionFile, content)
  expect(validateTeamSessionFile.bind(null, record, Buffer.byteLength(content))).toThrow(
    TEAM_SESSION_FIXTURE_INVALID_PATTERN,
  )
}

function acceptsBlankLinesAndFinalWhitespace(): void {
  const record = teamStorageRecord(fixture)
  const header = JSON.stringify({ type: TEAM_SESSION_FIXTURE_HEADER_TYPE, id: record.sessionId, cwd: record.cwd })
  const content = `${header}${TEAM_SESSION_FIXTURE_BLANK_LINES}${JSON.stringify({ type: TEAM_SESSION_FIXTURE_MESSAGE_TYPE })}${TEAM_SESSION_FIXTURE_FINAL_WHITESPACE}`
  writeFileSync(record.sessionFile, content)
  expect(validateTeamSessionFile.bind(null, record, Buffer.byteLength(content))).not.toThrow()
}

function rejectsMalformedEntry(): void {
  const record = teamStorageRecord(fixture)
  const content = `${JSON.stringify({ type: TEAM_SESSION_FIXTURE_HEADER_TYPE, id: record.sessionId, cwd: record.cwd })}${TEAM_SESSION_FIXTURE_MALFORMED_ENTRY}`
  writeFileSync(record.sessionFile, content)
  expect(validateTeamSessionFile.bind(null, record, Buffer.byteLength(content))).toThrow(
    TEAM_SESSION_FIXTURE_INVALID_PATTERN,
  )
}

function rejectsMismatchedIdentity(): void {
  const record = teamStorageRecord(fixture)
  const content = JSON.stringify({
    type: TEAM_SESSION_FIXTURE_HEADER_TYPE,
    id: TEAM_SESSION_FIXTURE_OTHER_ID,
    cwd: record.cwd,
  })
  writeFileSync(record.sessionFile, content)
  expect(validateTeamSessionFile.bind(null, record, Buffer.byteLength(content))).toThrow(
    TEAM_SESSION_FIXTURE_DIVERGENT_PATTERN,
  )
}

function rejectsZeroWidthSuffix(): void {
  const record = teamStorageRecord(fixture)
  const header = JSON.stringify({ type: TEAM_SESSION_FIXTURE_HEADER_TYPE, id: record.sessionId, cwd: record.cwd })
  const content = header + TEAM_SESSION_FIXTURE_ZERO_WIDTH_END
  writeFileSync(record.sessionFile, content)
  expect(validateTeamSessionFile.bind(null, record, Buffer.byteLength(content))).toThrow(
    TEAM_SESSION_FIXTURE_INVALID_PATTERN,
  )
}

function registerTests(): void {
  test(TEAM_SESSION_FIXTURE_ZERO_WIDTH_TEST, rejectsZeroWidthSuffix)
  beforeEach(prepare)
  afterEach(cleanup)
  test(TEAM_SESSION_FIXTURE_INTERIOR_WHITESPACE_TEST, rejectsWhitespaceOnlyInteriorLine)
  test(TEAM_SESSION_FIXTURE_BLANK_LINES_TEST, acceptsBlankLinesAndFinalWhitespace)
  test(TEAM_SESSION_FIXTURE_MALFORMED_TEST, rejectsMalformedEntry)
  test(TEAM_SESSION_FIXTURE_IDENTITY_TEST, rejectsMismatchedIdentity)
}

describe(TEAM_SESSION_FIXTURE_VALIDATION_SUITE, registerTests)
