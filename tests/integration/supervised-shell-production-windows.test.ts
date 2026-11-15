import { existsSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { createPreparedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  runWindowsNativeFaults,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  SUPERVISED_TEST_WINDOWS_ARGUMENT,
  SUPERVISED_TEST_WINDOWS_CLOSE_TITLE,
  SUPERVISED_TEST_WINDOWS_EFFECT_SCRIPT,
  SUPERVISED_TEST_WINDOWS_INVALID_TITLE,
  SUPERVISED_TEST_WINDOWS_NATIVE_FAILURE_TITLE,
  SUPERVISED_TEST_WINDOWS_NOACK_EFFECT,
  SUPERVISED_TEST_WINDOWS_NOACK_TITLE,
  SUPERVISED_TEST_WINDOWS_OVERSIZE_TITLE,
  SUPERVISED_TEST_WINDOWS_PRODUCTION_TITLE,
  SUPERVISED_TEST_WINDOWS_SCRIPT,
  SUPERVISED_TEST_WINDOWS_TRUNCATED_TITLE,
  SUPERVISED_TEST_WINDOWS_UTF8_TITLE,
  type SupervisedTestEnvironmentEntry,
  SupervisedTestOutput,
  WindowsRawChannel,
} from "../fixtures"

async function productionWindowsArguments(): Promise<void> {
  if (process.platform === SUPERVISED_TEST_WINDOWS) {
    const output = new SupervisedTestOutput()
    const lease = await createPreparedShell(
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
      await lease.terminate()
    }
  } else {
    expect(process.platform).not.toBe(SUPERVISED_TEST_WINDOWS)
  }
}

async function productionNoAck(): Promise<void> {
  if (process.platform === SUPERVISED_TEST_WINDOWS) {
    const directory = mkdtempSync(join(tmpdir(), SUPERVISED_TEST_WINDOWS_NOACK_EFFECT))
    const effect = join(directory, SUPERVISED_TEST_WINDOWS_NOACK_EFFECT)
    const output = new SupervisedTestOutput()
    try {
      const lease = await createPreparedShell(
        {
          executable: process.execPath,
          arguments: ["-e", SUPERVISED_TEST_WINDOWS_EFFECT_SCRIPT, effect],
          cwd: directory,
          environment: process.env,
        },
        output,
      )
      expect(existsSync(effect)).toBe(false)
      await lease.terminate()
      expect(existsSync(effect)).toBe(false)
      expect(output.text()).toBe("")
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  } else {
    expect(process.platform).not.toBe(SUPERVISED_TEST_WINDOWS)
  }
}

async function closeOnlyJobHandle(): Promise<void> {
  if (process.platform === SUPERVISED_TEST_WINDOWS) {
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
          arguments: ["-e", SUPERVISED_TEST_WINDOWS_SCRIPT, SUPERVISED_TEST_WINDOWS_ARGUMENT],
          cwd: process.cwd(),
          environment,
        }),
      ),
      true,
    )
    expect(await channel.completion).not.toBe(0)
    expect(channel.error).toContain("WINDOWS_READY")
  } else {
    expect(process.platform).not.toBe(SUPERVISED_TEST_WINDOWS)
  }
}

async function rejectsMalformedJson(): Promise<void> {
  if (process.platform === SUPERVISED_TEST_WINDOWS) {
    const channel = new WindowsRawChannel(Buffer.from("{"), false)
    expect(await channel.completion).not.toBe(0)
    expect(channel.error).not.toContain("WINDOWS_READY")
  } else {
    expect(process.platform).not.toBe(SUPERVISED_TEST_WINDOWS)
  }
}

async function rejectsOversizeFrame(): Promise<void> {
  if (process.platform === SUPERVISED_TEST_WINDOWS) {
    const channel = new WindowsRawChannel(Buffer.alloc(0), false, 1048577)
    expect(await channel.completion).not.toBe(0)
    expect(channel.error).toContain("Shell frame exceeds byte limit")
  } else {
    expect(process.platform).not.toBe(SUPERVISED_TEST_WINDOWS)
  }
}

async function rejectsInvalidUtf8(): Promise<void> {
  if (process.platform === SUPERVISED_TEST_WINDOWS) {
    const channel = new WindowsRawChannel(Buffer.from([255]), false)
    expect(await channel.completion).not.toBe(0)
  } else {
    expect(process.platform).not.toBe(SUPERVISED_TEST_WINDOWS)
  }
}

async function rejectsTruncatedFrame(): Promise<void> {
  if (process.platform === SUPERVISED_TEST_WINDOWS) {
    const channel = new WindowsRawChannel(Buffer.from("{"), false, 2)
    expect(await channel.completion).not.toBe(0)
    expect(channel.error).toContain("Incomplete shell frame body")
  } else {
    expect(process.platform).not.toBe(SUPERVISED_TEST_WINDOWS)
  }
}

async function nativeFailuresAreChecked(): Promise<void> {
  if (process.platform === SUPERVISED_TEST_WINDOWS) {
    const output = await runWindowsNativeFaults()
    expect(output).toContain("WaitChecked:CHECKED")
    expect(output).toContain("ResumeChecked:CHECKED")
    expect(output).toContain("AssignProcessToJobObject:REFUSED")
  } else {
    expect(process.platform).not.toBe(SUPERVISED_TEST_WINDOWS)
  }
}

test(SUPERVISED_TEST_WINDOWS_PRODUCTION_TITLE, productionWindowsArguments, SUPERVISED_TEST_TIMEOUT_MS)
test(SUPERVISED_TEST_WINDOWS_NOACK_TITLE, productionNoAck, SUPERVISED_TEST_TIMEOUT_MS)

test(SUPERVISED_TEST_WINDOWS_CLOSE_TITLE, closeOnlyJobHandle, SUPERVISED_TEST_TIMEOUT_MS)
test(SUPERVISED_TEST_WINDOWS_INVALID_TITLE, rejectsMalformedJson, SUPERVISED_TEST_TIMEOUT_MS)

test(SUPERVISED_TEST_WINDOWS_OVERSIZE_TITLE, rejectsOversizeFrame, SUPERVISED_TEST_TIMEOUT_MS)
test(SUPERVISED_TEST_WINDOWS_UTF8_TITLE, rejectsInvalidUtf8, SUPERVISED_TEST_TIMEOUT_MS)
test(SUPERVISED_TEST_WINDOWS_TRUNCATED_TITLE, rejectsTruncatedFrame, SUPERVISED_TEST_TIMEOUT_MS)

test(SUPERVISED_TEST_WINDOWS_NATIVE_FAILURE_TITLE, nativeFailuresAreChecked, SUPERVISED_TEST_TIMEOUT_MS)
