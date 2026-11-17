import { appendFileSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { afterEach, beforeEach, describe, expect, test } from "vitest"
import { openTeamMemberStorage, PiTeamMemberJournal, validateTeamSessionFile } from "#synapse/integration/pi/agent-team"
import {
  STREAM_SESSION_ACTIVE_STATE,
  STREAM_SESSION_AFTER,
  STREAM_SESSION_BAD_ENTRY,
  STREAM_SESSION_BAD_JSON,
  STREAM_SESSION_BAD_UTF8,
  STREAM_SESSION_BYTES,
  STREAM_SESSION_DIVERGENT,
  STREAM_SESSION_ENVELOPE_TEST,
  STREAM_SESSION_FINAL_LINE_TEST,
  STREAM_SESSION_HEADER_SUFFIX_TEST,
  STREAM_SESSION_HEADER_TEST,
  STREAM_SESSION_IDENTITY_TEST,
  STREAM_SESSION_INITIAL_BOM,
  STREAM_SESSION_INITIAL_BOM_TEST,
  STREAM_SESSION_INTERIOR_UNICODE_TEST,
  STREAM_SESSION_INVALID,
  STREAM_SESSION_JSON_TEST,
  STREAM_SESSION_LARGE_TEST,
  STREAM_SESSION_LEAF,
  STREAM_SESSION_MODEL,
  STREAM_SESSION_NEWLINE,
  STREAM_SESSION_PADDING,
  STREAM_SESSION_PADDING_PREFIX,
  STREAM_SESSION_PADDING_SUFFIX,
  STREAM_SESSION_PROVIDER,
  STREAM_SESSION_READ_CHUNK_BYTES,
  STREAM_SESSION_SPLIT_TEXT,
  STREAM_SESSION_SPLIT_UTF8_TEST,
  STREAM_SESSION_SUFFIX_ENTRY,
  STREAM_SESSION_SUFFIX_TEST,
  STREAM_SESSION_SUITE,
  STREAM_SESSION_THINKING,
  STREAM_SESSION_TRUNCATED_JSON,
  STREAM_SESSION_TRUNCATED_JSON_TEST,
  STREAM_SESSION_TRUNCATED_UTF8,
  STREAM_SESSION_TRUNCATED_UTF8_TEST,
  STREAM_SESSION_UNICODE_INTERIOR,
  STREAM_SESSION_UNICODE_SUFFIXES,
  STREAM_SESSION_USER_ROLE,
  STREAM_SESSION_UTF8_TEST,
  STREAM_SESSION_WRONG_ID,
  STREAM_SESSION_ZERO_WIDTH_SUFFIX,
  STREAM_SESSION_ZERO_WIDTH_TEST,
  StreamingSessionFixture,
} from "../fixtures"

let fixture: StreamingSessionFixture

function prepare(): void {
  fixture = new StreamingSessionFixture()
}

function cleanup(): void {
  fixture.dispose()
}

function opensLargeNativeSession(): void {
  fixture.writeLargeSession()
  const before = statSync(fixture.path).size
  expect(before).toBeGreaterThan(STREAM_SESSION_BYTES)
  const storage = openTeamMemberStorage(fixture.record)
  expect(storage.getSessionId()).toBe(fixture.record.sessionId)
  expect(storage.getCwd()).toBe(fixture.record.cwd)
  expect(storage.getLeafId()).toBe(STREAM_SESSION_LEAF)
  expect(new PiTeamMemberJournal(storage).load()).toEqual(STREAM_SESSION_ACTIVE_STATE)
  const context = storage.buildSessionContext()
  expect(context.model).toEqual({ provider: STREAM_SESSION_PROVIDER, modelId: STREAM_SESSION_MODEL })
  expect(context.thinkingLevel).toBe(STREAM_SESSION_THINKING)
  expect(storage.getEntries().length).toBeGreaterThan(storage.getBranch().length)
  expect(statSync(fixture.path).size).toBe(before)
  storage.appendMessage({ role: STREAM_SESSION_USER_ROLE, content: STREAM_SESSION_AFTER, timestamp: 0 })
  expect(statSync(fixture.path).size).toBeGreaterThan(before)
  const reopened = openTeamMemberStorage(fixture.record)
  expect(new PiTeamMemberJournal(reopened).load()).toEqual(STREAM_SESSION_ACTIVE_STATE)
  const lastMessage = reopened.buildSessionContext().messages.at(-1)
  expect(lastMessage?.role).toBe(STREAM_SESSION_USER_ROLE)
  if (lastMessage?.role === STREAM_SESSION_USER_ROLE) {
    expect(lastMessage.content).toBe(STREAM_SESSION_AFTER)
  }
}

function rejectsMalformedJson(): void {
  writeFileSync(fixture.path, fixture.header() + STREAM_SESSION_NEWLINE + STREAM_SESSION_BAD_JSON)
  expect(openTeamMemberStorage.bind(null, fixture.record)).toThrow(STREAM_SESSION_INVALID)
}

function rejectsInvalidEnvelope(): void {
  writeFileSync(fixture.path, fixture.header() + STREAM_SESSION_NEWLINE + STREAM_SESSION_BAD_ENTRY)
  expect(openTeamMemberStorage.bind(null, fixture.record)).toThrow(STREAM_SESSION_INVALID)
}

function rejectsInvalidHeader(): void {
  writeFileSync(fixture.path, STREAM_SESSION_BAD_ENTRY)
  expect(openTeamMemberStorage.bind(null, fixture.record)).toThrow(STREAM_SESSION_INVALID)
}

function rejectsTruncatedJson(): void {
  writeFileSync(fixture.path, fixture.header() + STREAM_SESSION_NEWLINE + STREAM_SESSION_TRUNCATED_JSON)
  const before = readFileSync(fixture.path)
  expect(openTeamMemberStorage.bind(null, fixture.record)).toThrow(STREAM_SESSION_INVALID)
  expect(readFileSync(fixture.path)).toEqual(before)
}

function rejectsInvalidUtf8(): void {
  writeFileSync(fixture.path, `${fixture.header().slice(0, -1)}${STREAM_SESSION_PADDING_PREFIX}`)
  appendFileSync(fixture.path, STREAM_SESSION_BAD_UTF8)
  appendFileSync(fixture.path, STREAM_SESSION_PADDING_SUFFIX + STREAM_SESSION_NEWLINE)
  expect(openTeamMemberStorage.bind(null, fixture.record)).toThrow(STREAM_SESSION_INVALID)
}

function rejectsTruncatedUtf8(): void {
  writeFileSync(fixture.path, fixture.header() + STREAM_SESSION_NEWLINE)
  appendFileSync(fixture.path, STREAM_SESSION_TRUNCATED_UTF8)
  expect(openTeamMemberStorage.bind(null, fixture.record)).toThrow(STREAM_SESSION_INVALID)
}

function rejectsIdentityWithoutOpening(): void {
  writeFileSync(fixture.path, fixture.header())
  const before = readFileSync(fixture.path)
  expect(openTeamMemberStorage.bind(null, { ...fixture.record, sessionId: STREAM_SESSION_WRONG_ID })).toThrow(
    STREAM_SESSION_DIVERGENT,
  )
  expect(readFileSync(fixture.path)).toEqual(before)
}

function acceptsCompleteFinalLineWithoutNewline(): void {
  writeFileSync(fixture.path, fixture.header())
  const before = statSync(fixture.path).size
  expect(openTeamMemberStorage(fixture.record).getSessionId()).toBe(fixture.record.sessionId)
  expect(statSync(fixture.path).size).toBe(before + 1)
}

function acceptsSplitUtf8(): void {
  const prefix = `${fixture.header().slice(0, -1)}${STREAM_SESSION_PADDING_PREFIX}`
  const padding = STREAM_SESSION_PADDING.repeat(STREAM_SESSION_READ_CHUNK_BYTES - Buffer.byteLength(prefix) - 1)
  writeFileSync(
    fixture.path,
    `${prefix}${padding}${STREAM_SESSION_SPLIT_TEXT}${STREAM_SESSION_PADDING_SUFFIX}${STREAM_SESSION_NEWLINE}`,
  )
  expect(openTeamMemberStorage(fixture.record).getSessionId()).toBe(fixture.record.sessionId)
}

function acceptsGlobalUnicodeSuffix(suffix: string): void {
  writeFileSync(
    fixture.path,
    fixture.header() + STREAM_SESSION_NEWLINE + JSON.stringify(STREAM_SESSION_SUFFIX_ENTRY) + suffix,
  )
  expect(openTeamMemberStorage(fixture.record).getSessionId()).toBe(fixture.record.sessionId)
}

function acceptsHeaderGlobalSuffix(suffix: string): void {
  writeFileSync(fixture.path, fixture.header() + suffix)
  expect(validateTeamSessionFile.bind(null, fixture.record)).not.toThrow()
}

function rejectsInteriorUnicode(): void {
  const entry = JSON.stringify(STREAM_SESSION_SUFFIX_ENTRY)
  writeFileSync(
    fixture.path,
    fixture.header() +
      STREAM_SESSION_NEWLINE +
      entry +
      STREAM_SESSION_UNICODE_INTERIOR +
      entry +
      STREAM_SESSION_NEWLINE,
  )
  expect(openTeamMemberStorage.bind(null, fixture.record)).toThrow(STREAM_SESSION_INVALID)
}

function rejectsInitialBom(): void {
  writeFileSync(fixture.path, STREAM_SESSION_INITIAL_BOM + fixture.header() + STREAM_SESSION_NEWLINE)
  expect(openTeamMemberStorage.bind(null, fixture.record)).toThrow(STREAM_SESSION_INVALID)
}

function rejectsZeroWidthSuffix(): void {
  writeFileSync(
    fixture.path,
    fixture.header() +
      STREAM_SESSION_NEWLINE +
      JSON.stringify(STREAM_SESSION_SUFFIX_ENTRY) +
      STREAM_SESSION_ZERO_WIDTH_SUFFIX,
  )
  expect(openTeamMemberStorage.bind(null, fixture.record)).toThrow(STREAM_SESSION_INVALID)
}

function registerTests(): void {
  beforeEach(prepare)
  afterEach(cleanup)
  test.each(STREAM_SESSION_UNICODE_SUFFIXES)(STREAM_SESSION_SUFFIX_TEST, acceptsGlobalUnicodeSuffix)
  test.each(STREAM_SESSION_UNICODE_SUFFIXES)(STREAM_SESSION_HEADER_SUFFIX_TEST, acceptsHeaderGlobalSuffix)
  test(STREAM_SESSION_INTERIOR_UNICODE_TEST, rejectsInteriorUnicode)
  test(STREAM_SESSION_INITIAL_BOM_TEST, rejectsInitialBom)
  test(STREAM_SESSION_ZERO_WIDTH_TEST, rejectsZeroWidthSuffix)
  test(STREAM_SESSION_LARGE_TEST, opensLargeNativeSession)
  test(STREAM_SESSION_JSON_TEST, rejectsMalformedJson)
  test(STREAM_SESSION_ENVELOPE_TEST, rejectsInvalidEnvelope)
  test(STREAM_SESSION_HEADER_TEST, rejectsInvalidHeader)
  test(STREAM_SESSION_TRUNCATED_JSON_TEST, rejectsTruncatedJson)
  test(STREAM_SESSION_UTF8_TEST, rejectsInvalidUtf8)
  test(STREAM_SESSION_TRUNCATED_UTF8_TEST, rejectsTruncatedUtf8)
  test(STREAM_SESSION_IDENTITY_TEST, rejectsIdentityWithoutOpening)
  test(STREAM_SESSION_FINAL_LINE_TEST, acceptsCompleteFinalLineWithoutNewline)
  test(STREAM_SESSION_SPLIT_UTF8_TEST, acceptsSplitUtf8)
}

describe(STREAM_SESSION_SUITE, registerTests)
