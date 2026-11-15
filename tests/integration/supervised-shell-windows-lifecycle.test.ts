import { expect, test } from "vitest"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  runWindowsScript,
  SlowSupervisedOutput,
  SUPERVISED_TEST_TIMEOUT_MS,
  SUPERVISED_TEST_WINDOWS,
  SUPERVISED_TEST_WINDOWS_BIG_STDIN_TITLE,
  SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_TITLE,
  SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_URL,
  SUPERVISED_TEST_WINDOWS_FOREGROUND_DRAIN_TITLE,
  SupervisedTestOutput,
} from "../fixtures"

async function cleanupCollectsEveryFailure(): Promise<void> {
  expect(await runWindowsScript(SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_URL, [])).toContain("CLEANUP_ALL_ATTEMPTED")
}

async function largeStdinDoesNotBlockStop(): Promise<void> {
  const output = new SupervisedTestOutput()
  const supervisor = createSupervisedShell()
  const lease = await supervisor.create(
    {
      executable: process.execPath,
      arguments: ["-e", "process.stdout.write('WINDOWS_READY\\n');setInterval(()=>{},1000)"],
      cwd: process.cwd(),
      environment: process.env,
      input: "x".repeat(600000),
    },
    output,
  )
  try {
    lease.release()
    await output.waitForMarker()
    await lease.terminate()
    expect(lease.state).toBe("exited")
  } finally {
    await supervisor.close()
  }
}

async function foregroundProducerFence(): Promise<void> {
  const output = new SlowSupervisedOutput()
  const supervisor = createSupervisedShell()
  const lease = await supervisor.create(
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
    await supervisor.close()
  }
}

test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_WINDOWS_CLEANUP_FAULTS_TITLE,
  cleanupCollectsEveryFailure,
  SUPERVISED_TEST_TIMEOUT_MS,
)
test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_WINDOWS_BIG_STDIN_TITLE,
  largeStdinDoesNotBlockStop,
  SUPERVISED_TEST_TIMEOUT_MS,
)
test.skipIf(process.platform !== SUPERVISED_TEST_WINDOWS)(
  SUPERVISED_TEST_WINDOWS_FOREGROUND_DRAIN_TITLE,
  foregroundProducerFence,
  SUPERVISED_TEST_TIMEOUT_MS,
)
