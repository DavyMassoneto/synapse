import { spawn } from "node:child_process"
import { existsSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  SUPERVISED_TEST_EXITED_STATE,
  SUPERVISED_TEST_IGNORED_STDIO,
  SUPERVISED_TEST_NODE_EVAL_FLAG,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  SUPERVISED_TEST_WINDOWS_ARGUMENT,
  SUPERVISED_TEST_WINDOWS_EFFECT_SCRIPT,
  SUPERVISED_TEST_WINDOWS_NOACK_EFFECT,
  SUPERVISED_TEST_WINDOWS_NOACK_TITLE,
  SUPERVISED_TEST_WINDOWS_PRODUCTION_TITLE,
  SUPERVISED_TEST_WINDOWS_SCRIPT,
  SUPERVISED_TEST_WINDOWS_SENTINEL_SCRIPT,
  SupervisedTestOutput,
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
