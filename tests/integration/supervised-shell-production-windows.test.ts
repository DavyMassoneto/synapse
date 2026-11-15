import { existsSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import { verifyCloseJobObservation, verifyCloseJobStatus } from "#synapse/modules/agent-team/tests"
import {
  runWindowsScript,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  SUPERVISED_TEST_WINDOWS_ARGUMENT,
  SUPERVISED_TEST_WINDOWS_CHILD_LIFETIME_MS,
  SUPERVISED_TEST_WINDOWS_CLOSE_DEADLINE_MS,
  SUPERVISED_TEST_WINDOWS_CLOSE_TITLE,
  SUPERVISED_TEST_WINDOWS_EFFECT_SCRIPT,
  SUPERVISED_TEST_WINDOWS_FAULTS_URL,
  SUPERVISED_TEST_WINDOWS_INVALID_TITLE,
  SUPERVISED_TEST_WINDOWS_NATIVE_FAILURE_TITLE,
  SUPERVISED_TEST_WINDOWS_NOACK_EFFECT,
  SUPERVISED_TEST_WINDOWS_NOACK_TITLE,
  SUPERVISED_TEST_WINDOWS_OBSERVE_URL,
  SUPERVISED_TEST_WINDOWS_OVERSIZE_TITLE,
  SUPERVISED_TEST_WINDOWS_PID_SCRIPT,
  SUPERVISED_TEST_WINDOWS_PRODUCTION_TITLE,
  SUPERVISED_TEST_WINDOWS_SCRIPT,
  SUPERVISED_TEST_WINDOWS_TRUNCATED_TITLE,
  SUPERVISED_TEST_WINDOWS_UTF8_TITLE,
  type SupervisedTestEnvironmentEntry,
  SupervisedTestOutput,
  WindowsRawChannel,
} from "../fixtures"

async function productionWindowsArguments(): Promise<void> {
  const output = new SupervisedTestOutput()
  const supervisor = createSupervisedShell()
  const lease = await supervisor.create(
    {
      executable: process.execPath,
      arguments: ["-e", SUPERVISED_TEST_WINDOWS_SCRIPT, SUPERVISED_TEST_WINDOWS_ARGUMENT],
      cwd: process.cwd(),
      environment: { ...process.env, PROOF_ENV: SUPERVISED_TEST_WINDOWS_ARGUMENT },
    },
    output,
  )
  try {
    lease.release()
    await output.waitForMarker()
    expect(output.text()).toContain(JSON.stringify(SUPERVISED_TEST_WINDOWS_ARGUMENT))
    expect(output.text()).toContain(JSON.stringify(process.cwd()))
    await lease.terminate()
    expect(lease.state).toBe("exited")
  } finally {
    await supervisor.close()
  }
}

async function productionNoAck(): Promise<void> {
  const directory = mkdtempSync(join(tmpdir(), SUPERVISED_TEST_WINDOWS_NOACK_EFFECT))
  const effect = join(directory, SUPERVISED_TEST_WINDOWS_NOACK_EFFECT)
  const output = new SupervisedTestOutput()
  const supervisor = createSupervisedShell()
  try {
    await supervisor.create(
      {
        executable: process.execPath,
        arguments: ["-e", SUPERVISED_TEST_WINDOWS_EFFECT_SCRIPT, effect],
        cwd: directory,
        environment: process.env,
      },
      output,
    )
    expect(existsSync(effect)).toBe(false)
    await supervisor.close()
    expect(existsSync(effect)).toBe(false)
    expect(output.text()).toBe("")
  } finally {
    await supervisor.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

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
        arguments: ["-e", SUPERVISED_TEST_WINDOWS_PID_SCRIPT],
        cwd: process.cwd(),
        environment,
      }),
    ),
    true,
  )
  const code = await channel.completion
  const pid = /CHILD_PID:(\d+)/.exec(channel.error)?.[1]
  let observed = "CHILD_PID_MISSING"
  if (pid) {
    observed = await runWindowsScript(SUPERVISED_TEST_WINDOWS_OBSERVE_URL, [pid])
  }
  console.log({
    launcherCode: code,
    childPid: pid,
    childObservation: observed.trim(),
    statusHex: channel.statusBytes.toString("hex"),
  })
  expect(code).toBe(0)
  expect(typeof pid).toBe("string")
  if (typeof pid === "string") {
    verifyCloseJobObservation(pid, observed)
  }
  expect(channel.error).toContain("WINDOWS_READY")
  expect(typeof channel.closeStarted).toBe("number")
  expect(typeof channel.closeFinished).toBe("number")
  if (typeof channel.closeStarted === "number" && typeof channel.closeFinished === "number") {
    const elapsed = channel.closeFinished - channel.closeStarted
    expect(elapsed).toBeLessThan(SUPERVISED_TEST_WINDOWS_CLOSE_DEADLINE_MS)
    expect(elapsed).toBeLessThan(SUPERVISED_TEST_WINDOWS_CHILD_LIFETIME_MS)
  }
  verifyCloseJobStatus(channel.statusBytes)
}

async function rejectsMalformedJson(): Promise<void> {
  const channel = new WindowsRawChannel(Buffer.from("{"), false)
  expect(await channel.completion).not.toBe(0)
  expect(channel.error).not.toContain("WINDOWS_READY")
}

async function rejectsOversizeFrame(): Promise<void> {
  const channel = new WindowsRawChannel(Buffer.alloc(0), false, 1048577)
  expect(await channel.completion).not.toBe(0)
  expect(channel.error).toContain("Shell frame exceeds byte limit")
}

async function rejectsInvalidUtf8(): Promise<void> {
  const channel = new WindowsRawChannel(Buffer.from([255]), false)
  expect(await channel.completion).not.toBe(0)
}

async function rejectsTruncatedFrame(): Promise<void> {
  const channel = new WindowsRawChannel(Buffer.from("{"), false, 2)
  expect(await channel.completion).not.toBe(0)
  expect(channel.error).toContain("Incomplete shell frame body")
}

async function nativeFailuresAreChecked(): Promise<void> {
  const output = await runWindowsScript(SUPERVISED_TEST_WINDOWS_FAULTS_URL, [])
  expect(output).toContain("WaitChecked:CHECKED")
  expect(output).toContain("ResumeChecked:CHECKED")
  expect(output).toContain("AssignProcessToJobObject:REFUSED")
}

test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_WINDOWS_PRODUCTION_TITLE,
  productionWindowsArguments,
  SUPERVISED_TEST_TIMEOUT_MS,
)
test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_WINDOWS_NOACK_TITLE,
  productionNoAck,
  SUPERVISED_TEST_TIMEOUT_MS,
)

test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_WINDOWS_CLOSE_TITLE,
  closeOnlyJobHandle,
  SUPERVISED_TEST_TIMEOUT_MS,
)
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

test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_WINDOWS_NATIVE_FAILURE_TITLE,
  nativeFailuresAreChecked,
  SUPERVISED_TEST_TIMEOUT_MS,
)
