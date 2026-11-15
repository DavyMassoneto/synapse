import { expect, test } from "vitest"
import { createPreparedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  runWindowsCleanupFaults,
  SlowSupervisedOutput,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  SUPERVISED_TEST_WINDOWS_BIG_STDIN_TITLE,
  SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_TITLE,
  SUPERVISED_TEST_WINDOWS_FOREGROUND_DRAIN_TITLE,
  SupervisedTestOutput,
} from "../fixtures"

async function cleanupCollectsEveryFailure(): Promise<void> {
  if (process.platform === SUPERVISED_TEST_WINDOWS) {
    expect(await runWindowsCleanupFaults()).toContain("CLEANUP_ALL_ATTEMPTED")
  } else {
    expect(process.platform).not.toBe(SUPERVISED_TEST_WINDOWS)
  }
}

async function largeStdinDoesNotBlockStop(): Promise<void> {
  if (process.platform === SUPERVISED_TEST_WINDOWS) {
    const output = new SupervisedTestOutput()
    const lease = await createPreparedShell(
      {
        executable: process.execPath,
        arguments: ["-e", "process.stdout.write('WINDOWS_READY\\n');setInterval(()=>{},1000)"],
        cwd: process.cwd(),
        environment: process.env,
        input: "x".repeat(600000),
      },
      output,
    )
    lease.release()
    await output.waitForMarker()
    await lease.terminate()
    expect(lease.state).toBe("exited")
  } else {
    expect(process.platform).not.toBe(SUPERVISED_TEST_WINDOWS)
  }
}

async function foregroundProducerFence(): Promise<void> {
  if (process.platform === SUPERVISED_TEST_WINDOWS) {
    const output = new SlowSupervisedOutput()
    const lease = await createPreparedShell(
      {
        executable: process.execPath,
        arguments: ["-e", "process.stdout.write(Buffer.alloc(200000,120))"],
        cwd: process.cwd(),
        environment: process.env,
      },
      output,
    )
    try {
      lease.release()
      expect(await lease.completion).toBe(0)
      expect(output.bytes).toBe(200000)
    } finally {
      await lease.terminate()
    }
  } else {
    expect(process.platform).not.toBe(SUPERVISED_TEST_WINDOWS)
  }
}

test(SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_TITLE, cleanupCollectsEveryFailure, SUPERVISED_TEST_TIMEOUT_MS)
test(SUPERVISED_TEST_WINDOWS_BIG_STDIN_TITLE, largeStdinDoesNotBlockStop, SUPERVISED_TEST_TIMEOUT_MS)
test(SUPERVISED_TEST_WINDOWS_FOREGROUND_DRAIN_TITLE, foregroundProducerFence, SUPERVISED_TEST_TIMEOUT_MS)
