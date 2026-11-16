import { expect, test } from "vitest"
import {
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_TITLE,
  SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_URL,
  SUPERVISED_TEST_WINDOWS_CLEANUP_MARKER,
} from "./constants"
import { runWindowsScript } from "./windows-faults"

async function cleanupCollectsEveryFailure(): Promise<void> {
  expect(await runWindowsScript(SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_URL, [])).toContain(
    SUPERVISED_TEST_WINDOWS_CLEANUP_MARKER,
  )
}

test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_TITLE,
  cleanupCollectsEveryFailure,
  SUPERVISED_TEST_TIMEOUT_MS,
)
