import { expect, test } from "vitest"
import { verifyCloseJobObservation, verifyCloseJobStatus } from "./close-job-proof"
import {
  SUPERVISED_TEST_NODE_EVAL_FLAG,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  SUPERVISED_TEST_WINDOWS_CHILD_LIFETIME_MS,
  SUPERVISED_TEST_WINDOWS_CHILD_PID_PATTERN,
  SUPERVISED_TEST_WINDOWS_CLOSE_DEADLINE_MS,
  SUPERVISED_TEST_WINDOWS_CLOSE_TITLE,
  SUPERVISED_TEST_WINDOWS_FAULTS_URL,
  SUPERVISED_TEST_WINDOWS_MARKER,
  SUPERVISED_TEST_WINDOWS_MISSING_PID,
  SUPERVISED_TEST_WINDOWS_NATIVE_FAILURE_TITLE,
  SUPERVISED_TEST_WINDOWS_NATIVE_FAULT_CASES,
  SUPERVISED_TEST_WINDOWS_OBSERVE_URL,
  SUPERVISED_TEST_WINDOWS_PID_SCRIPT,
} from "./constants"
import { type SupervisedTestEnvironmentEntry, type WindowsNativeFaultCase } from "./types"
import { WindowsRawChannel } from "./windows-channel"
import { runWindowsScript } from "./windows-faults"

async function closeOnlyJobHandle(): Promise<void> {
  const environment: SupervisedTestEnvironmentEntry[] = []
  for (const [name, value] of Object.entries(process.env)) {
    if (typeof value === "string") {
      environment.push({ name, value })
    }
  }
  const channel = new WindowsRawChannel(
    Buffer.from(
      JSON.stringify({
        executable: process.execPath,
        arguments: [SUPERVISED_TEST_NODE_EVAL_FLAG, SUPERVISED_TEST_WINDOWS_PID_SCRIPT],
        cwd: process.cwd(),
        environment,
      }),
    ),
    true,
  )
  const code = await channel.completion
  const pid = SUPERVISED_TEST_WINDOWS_CHILD_PID_PATTERN.exec(channel.error)?.[1]
  let observed = SUPERVISED_TEST_WINDOWS_MISSING_PID
  if (pid) {
    observed = await runWindowsScript(SUPERVISED_TEST_WINDOWS_OBSERVE_URL, [pid])
  }
  expect(code).toBe(0)
  expect(typeof pid).toBe("string")
  if (typeof pid === "string") {
    verifyCloseJobObservation(pid, observed)
  }
  expect(channel.error).toContain(SUPERVISED_TEST_WINDOWS_MARKER)
  expect(typeof channel.closeStarted).toBe("number")
  expect(typeof channel.closeFinished).toBe("number")
  if (typeof channel.closeStarted === "number" && typeof channel.closeFinished === "number") {
    const elapsed = channel.closeFinished - channel.closeStarted
    expect(elapsed).toBeLessThan(SUPERVISED_TEST_WINDOWS_CLOSE_DEADLINE_MS)
    expect(elapsed).toBeLessThan(SUPERVISED_TEST_WINDOWS_CHILD_LIFETIME_MS)
  }
  verifyCloseJobStatus(channel.statusBytes)
}

async function nativeFailuresAreChecked(scenario: WindowsNativeFaultCase): Promise<void> {
  const output = await runWindowsScript(SUPERVISED_TEST_WINDOWS_FAULTS_URL, [scenario.target])
  expect(output).toContain(scenario.expected)
}

test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_WINDOWS_CLOSE_TITLE,
  closeOnlyJobHandle,
  SUPERVISED_TEST_TIMEOUT_MS,
)
test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS).each(SUPERVISED_TEST_WINDOWS_NATIVE_FAULT_CASES)(
  SUPERVISED_TEST_WINDOWS_NATIVE_FAILURE_TITLE,
  nativeFailuresAreChecked,
  SUPERVISED_TEST_TIMEOUT_MS,
)
