import { expect, test } from "vitest"
import {
  COMPUTER_MOUNT_LIFECYCLE_DESCRIPTION,
  COMPUTER_MOUNT_LIFECYCLE_EVENTS,
  COMPUTER_MOUNT_LIFECYCLE_OPEN_DESCRIPTION,
  COMPUTER_MOUNT_LIFECYCLE_OPEN_EVENTS,
  COMPUTER_MOUNT_PID_MISSING,
  COMPUTER_MOUNT_PID_REPEATED_DESCRIPTION,
  COMPUTER_MOUNT_PID_REPEATED_EVENTS,
  COMPUTER_MOUNT_RESULT_ABSENT_TEXT,
  COMPUTER_MOUNT_RESULT_ABSENT_TEXT_DESCRIPTION,
  COMPUTER_MOUNT_RESULT_EMPTY,
  COMPUTER_MOUNT_RESULT_EMPTY_DESCRIPTION,
  COMPUTER_MOUNT_RESULT_EMPTY_FIRST,
  COMPUTER_MOUNT_RESULT_EMPTY_FIRST_DESCRIPTION,
  COMPUTER_MOUNT_RESULT_FIRST,
  COMPUTER_MOUNT_RESULT_FIRST_DESCRIPTION,
  COMPUTER_MOUNT_RESULT_LAST,
  COMPUTER_MOUNT_RESULT_LAST_DESCRIPTION,
  COMPUTER_MOUNT_RESULT_MISSING,
  COMPUTER_MOUNT_RESULT_NO_MESSAGE,
  COMPUTER_MOUNT_RESULT_NO_MESSAGE_DESCRIPTION,
  COMPUTER_MOUNT_RESULT_NON_TEXT,
  COMPUTER_MOUNT_RESULT_NON_TEXT_DESCRIPTION,
  COMPUTER_MOUNT_RESULT_RECOVERY,
  COMPUTER_MOUNT_RESULT_RECOVERY_DESCRIPTION,
  COMPUTER_MOUNT_RESULT_STRING,
  COMPUTER_MOUNT_RESULT_STRING_DESCRIPTION,
  COMPUTER_MOUNT_RESULT_WHITESPACE,
  COMPUTER_MOUNT_RESULT_WHITESPACE_DESCRIPTION,
  computerMountLifecycle,
  computerMountToolResultText,
} from "../fixtures"

function selectsLastToolResult(): void {
  expect(computerMountToolResultText(COMPUTER_MOUNT_RESULT_LAST)).toBe("último")
}

function selectsFirstTextBlock(): void {
  expect(computerMountToolResultText(COMPUTER_MOUNT_RESULT_FIRST)).toBe("primeiro")
}

function refusesEmptyLastToolResult(): void {
  expect(computerMountToolResultText.bind(null, COMPUTER_MOUNT_RESULT_EMPTY)).toThrow(COMPUTER_MOUNT_RESULT_MISSING)
}

function refusesEmptyFirstTextBlock(): void {
  expect(computerMountToolResultText.bind(null, COMPUTER_MOUNT_RESULT_EMPTY_FIRST)).toThrow(
    COMPUTER_MOUNT_RESULT_MISSING,
  )
}

function refusesAbsentFirstBlockText(): void {
  expect(computerMountToolResultText.bind(null, COMPUTER_MOUNT_RESULT_ABSENT_TEXT)).toThrow(
    COMPUTER_MOUNT_RESULT_MISSING,
  )
}

function refusesStringResultContent(): void {
  expect(computerMountToolResultText.bind(null, COMPUTER_MOUNT_RESULT_STRING)).toThrow(COMPUTER_MOUNT_RESULT_MISSING)
}

function refusesNonTextResultContent(): void {
  expect(computerMountToolResultText.bind(null, COMPUTER_MOUNT_RESULT_NON_TEXT)).toThrow(COMPUTER_MOUNT_RESULT_MISSING)
}

function refusesMissingToolResult(): void {
  expect(computerMountToolResultText.bind(null, COMPUTER_MOUNT_RESULT_NO_MESSAGE)).toThrow(
    COMPUTER_MOUNT_RESULT_MISSING,
  )
}

function preservesResultWhitespace(): void {
  expect(computerMountToolResultText(COMPUTER_MOUNT_RESULT_WHITESPACE)).toBe(" ")
}

function acceptsResultAfterEmptyMessage(): void {
  expect(computerMountToolResultText(COMPUTER_MOUNT_RESULT_RECOVERY)).toBe("primeiro")
}

function summarizesLifecycle(): void {
  expect(computerMountLifecycle(COMPUTER_MOUNT_LIFECYCLE_EVENTS)).toEqual({ pid: 12, sessionEndCount: 2 })
}

function summarizesOpenLifecycle(): void {
  expect(computerMountLifecycle(COMPUTER_MOUNT_LIFECYCLE_OPEN_EVENTS)).toEqual({ pid: 12, sessionEndCount: 0 })
}

function refusesRepeatedPidEvent(): void {
  expect(computerMountLifecycle.bind(null, COMPUTER_MOUNT_PID_REPEATED_EVENTS)).toThrow(COMPUTER_MOUNT_PID_MISSING)
}

test(COMPUTER_MOUNT_RESULT_LAST_DESCRIPTION, selectsLastToolResult)
test(COMPUTER_MOUNT_RESULT_FIRST_DESCRIPTION, selectsFirstTextBlock)
test(COMPUTER_MOUNT_RESULT_EMPTY_DESCRIPTION, refusesEmptyLastToolResult)
test(COMPUTER_MOUNT_RESULT_EMPTY_FIRST_DESCRIPTION, refusesEmptyFirstTextBlock)
test(COMPUTER_MOUNT_RESULT_ABSENT_TEXT_DESCRIPTION, refusesAbsentFirstBlockText)
test(COMPUTER_MOUNT_RESULT_STRING_DESCRIPTION, refusesStringResultContent)
test(COMPUTER_MOUNT_RESULT_NON_TEXT_DESCRIPTION, refusesNonTextResultContent)
test(COMPUTER_MOUNT_RESULT_NO_MESSAGE_DESCRIPTION, refusesMissingToolResult)
test(COMPUTER_MOUNT_RESULT_WHITESPACE_DESCRIPTION, preservesResultWhitespace)
test(COMPUTER_MOUNT_RESULT_RECOVERY_DESCRIPTION, acceptsResultAfterEmptyMessage)
test(COMPUTER_MOUNT_LIFECYCLE_DESCRIPTION, summarizesLifecycle)
test(COMPUTER_MOUNT_LIFECYCLE_OPEN_DESCRIPTION, summarizesOpenLifecycle)
test(COMPUTER_MOUNT_PID_REPEATED_DESCRIPTION, refusesRepeatedPidEvent)
