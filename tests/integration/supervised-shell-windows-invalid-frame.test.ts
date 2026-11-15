import { expect, test } from "vitest"
import {
  SUPERVISED_TEST_INCOMPLETE_JSON,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  SUPERVISED_TEST_WINDOWS_INVALID_TITLE,
  SUPERVISED_TEST_WINDOWS_MARKER,
  SUPERVISED_TEST_WINDOWS_OVERSIZE_ERROR,
  SUPERVISED_TEST_WINDOWS_OVERSIZE_TITLE,
  SUPERVISED_TEST_WINDOWS_TRUNCATED_ERROR,
  SUPERVISED_TEST_WINDOWS_TRUNCATED_TITLE,
  SUPERVISED_TEST_WINDOWS_UTF8_TITLE,
  WindowsRawChannel,
} from "../fixtures"

async function rejectsMalformedJson(): Promise<void> {
  const channel = new WindowsRawChannel(Buffer.from(SUPERVISED_TEST_INCOMPLETE_JSON), false)
  expect(await channel.completion).not.toBe(0)
  expect(channel.error).not.toContain(SUPERVISED_TEST_WINDOWS_MARKER)
}

async function rejectsOversizeFrame(): Promise<void> {
  const channel = new WindowsRawChannel(Buffer.alloc(0), false, 1048577)
  expect(await channel.completion).not.toBe(0)
  expect(channel.error).toContain(SUPERVISED_TEST_WINDOWS_OVERSIZE_ERROR)
}

async function rejectsInvalidUtf8(): Promise<void> {
  const channel = new WindowsRawChannel(Buffer.from([255]), false)
  expect(await channel.completion).not.toBe(0)
}

async function rejectsTruncatedFrame(): Promise<void> {
  const channel = new WindowsRawChannel(Buffer.from(SUPERVISED_TEST_INCOMPLETE_JSON), false, 2)
  expect(await channel.completion).not.toBe(0)
  expect(channel.error).toContain(SUPERVISED_TEST_WINDOWS_TRUNCATED_ERROR)
}

test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_WINDOWS_INVALID_TITLE,
  rejectsMalformedJson,
  SUPERVISED_TEST_TIMEOUT_MS,
)
test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_WINDOWS_OVERSIZE_TITLE,
  rejectsOversizeFrame,
  SUPERVISED_TEST_TIMEOUT_MS,
)
test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_WINDOWS_UTF8_TITLE,
  rejectsInvalidUtf8,
  SUPERVISED_TEST_TIMEOUT_MS,
)
test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_WINDOWS_TRUNCATED_TITLE,
  rejectsTruncatedFrame,
  SUPERVISED_TEST_TIMEOUT_MS,
)
