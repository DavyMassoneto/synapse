import { spawn } from "node:child_process"
import { existsSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  runWindowsScript,
  SUPERVISED_TEST_EXITED_STATE,
  SUPERVISED_TEST_IGNORED_STDIO,
  SUPERVISED_TEST_NODE_EVAL_FLAG,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  SUPERVISED_TEST_WINDOWS_ARGUMENT,
  SUPERVISED_TEST_WINDOWS_CHILD_LIFETIME_MS,
  SUPERVISED_TEST_WINDOWS_CHILD_PID_PATTERN,
  SUPERVISED_TEST_WINDOWS_CLOSE_DEADLINE_MS,
  SUPERVISED_TEST_WINDOWS_CLOSE_TITLE,
  SUPERVISED_TEST_WINDOWS_EFFECT_SCRIPT,
  SUPERVISED_TEST_WINDOWS_FAULTS_URL,
  SUPERVISED_TEST_WINDOWS_MARKER,
  SUPERVISED_TEST_WINDOWS_MISSING_PID,
  SUPERVISED_TEST_WINDOWS_NATIVE_FAILURE_TITLE,
  SUPERVISED_TEST_WINDOWS_NATIVE_FAULT_CASES,
  SUPERVISED_TEST_WINDOWS_NOACK_EFFECT,
  SUPERVISED_TEST_WINDOWS_NOACK_TITLE,
  SUPERVISED_TEST_WINDOWS_OBSERVE_URL,
  SUPERVISED_TEST_WINDOWS_PID_SCRIPT,
  SUPERVISED_TEST_WINDOWS_PRODUCTION_TITLE,
  SUPERVISED_TEST_WINDOWS_SCRIPT,
  SUPERVISED_TEST_WINDOWS_SENTINEL_SCRIPT,
  type SupervisedTestEnvironmentEntry,
  SupervisedTestOutput,
  verifyCloseJobObservation,
  verifyCloseJobStatus,
  type WindowsNativeFaultCase,
  WindowsRawChannel,
  type WindowsSentinel,
} from "../fixtures"

async function productionWindowsArguments(): Promise<void> {
  const output = new SupervisedTestOutput()
  const supervisor = createSupervisedShell()
  let sentinel: WindowsSentinel = null
  try {
    sentinel = spawn(process.execPath, [SUPERVISED_TEST_NODE_EVAL_FLAG, SUPERVISED_TEST_WINDOWS_SENTINEL_SCRIPT], {
      stdio: SUPERVISED_TEST_IGNORED_STDIO,
    })
    const lease = await supervisor.create(
      {
        executable: process.execPath,
        arguments: [SUPERVISED_TEST_NODE_EVAL_FLAG, SUPERVISED_TEST_WINDOWS_SCRIPT, SUPERVISED_TEST_WINDOWS_ARGUMENT],
        cwd: process.cwd(),
        environment: { ...process.env, PROOF_ENV: SUPERVISED_TEST_WINDOWS_ARGUMENT },
      },
      output,
    )
    lease.release()
    await output.waitForMarker()
    expect(output.text()).toContain(JSON.stringify(SUPERVISED_TEST_WINDOWS_ARGUMENT))
    expect(output.text()).toContain(JSON.stringify(process.cwd()))
    await lease.terminate()
    expect(lease.state).toBe(SUPERVISED_TEST_EXITED_STATE)
    expect(sentinel.exitCode).toBeNull()
  } finally {
    sentinel?.kill()
    await supervisor.close()
  }
}

async function productionNoAck(): Promise<void> {
  const output = new SupervisedTestOutput()
  const supervisor = createSupervisedShell()
  let directory = ""
  try {
    directory = mkdtempSync(join(tmpdir(), SUPERVISED_TEST_WINDOWS_NOACK_EFFECT))
    const effect = join(directory, SUPERVISED_TEST_WINDOWS_NOACK_EFFECT)
    await supervisor.create(
      {
        executable: process.execPath,
        arguments: [SUPERVISED_TEST_NODE_EVAL_FLAG, SUPERVISED_TEST_WINDOWS_EFFECT_SCRIPT, effect],
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
    try {
      await supervisor.close()
    } finally {
      if (directory) {
        rmSync(directory, { recursive: true, force: true })
      }
    }
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
test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS).each(SUPERVISED_TEST_WINDOWS_NATIVE_FAULT_CASES)(
  SUPERVISED_TEST_WINDOWS_NATIVE_FAILURE_TITLE,
  nativeFailuresAreChecked,
  SUPERVISED_TEST_TIMEOUT_MS,
)
