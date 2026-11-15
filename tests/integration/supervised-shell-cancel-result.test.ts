import { setImmediate } from "node:timers/promises"
import { createBashTool } from "@earendil-works/pi-coding-agent"
import { expect, test } from "vitest"
import { SupervisedBashOperations } from "#synapse/integration/pi/agent-team/supervised-bash"
import { createSupervisedShell } from "#synapse/modules/agent-team/public/supervised-shell"
import {
  CancelledResultShell,
  SUPERVISED_TEST_CANCEL_COMMAND,
  SUPERVISED_TEST_CANCEL_RESULT_ABORT_TITLE,
  SUPERVISED_TEST_CANCEL_RESULT_TIMEOUT_TITLE,
  SUPERVISED_TEST_CLOSED_ABORT_TITLE,
  SUPERVISED_TEST_IMMEDIATE_ABORT_TITLE,
  SUPERVISED_TEST_KILL_ERROR,
  SUPERVISED_TEST_OUTPUT_FAILURE,
} from "../fixtures"

async function cancelWithOutputFailure(abort: boolean, failed: boolean): Promise<void> {
  const shell = new CancelledResultShell()
  const operations = new SupervisedBashOperations(shell)
  const cancellation = new AbortController()
  const output: Buffer[] = []
  const executing = operations.exec(SUPERVISED_TEST_CANCEL_COMMAND, process.cwd(), {
    env: process.env,
    timeout: 0.01,
    signal: cancellation.signal,
    onData: output.push.bind(output),
  })
  const result = executing.catch(captureFailure)
  if (abort) {
    await setImmediate()
    cancellation.abort()
  }
  await shell.stopping
  shell.loseOutput()
  await expect(Promise.race([result, setImmediate()])).resolves.toBeUndefined()
  shell.finish(failed)
  const error = await result
  if (failed) {
    expect(error).toBeInstanceOf(AggregateError)
    if (error instanceof AggregateError) {
      expect(error.errors).toHaveLength(2)
      expect(error.errors[0]).toHaveProperty("message", SUPERVISED_TEST_OUTPUT_FAILURE)
      expect(error.errors[1]).toHaveProperty("message", SUPERVISED_TEST_KILL_ERROR)
    }
  } else {
    expect(error).toHaveProperty("message", SUPERVISED_TEST_OUTPUT_FAILURE)
  }
}
function captureFailure(error: Error): Error {
  return error
}
async function abortedOutput(failed: boolean): Promise<void> {
  await cancelWithOutputFailure(true, failed)
}
async function timedOutput(failed: boolean): Promise<void> {
  await cancelWithOutputFailure(false, failed)
}
async function immediateAbort(): Promise<void> {
  const shell = createSupervisedShell()
  const operations = new SupervisedBashOperations(shell)
  const signal = new AbortController()
  const output: Buffer[] = []
  try {
    const tool = createBashTool(process.cwd(), { operations, exposeSessionEnvironment: false })
    const executing = tool.execute(
      SUPERVISED_TEST_CANCEL_COMMAND,
      { command: SUPERVISED_TEST_CANCEL_COMMAND },
      signal.signal,
    )
    signal.abort()
    await expect(executing).rejects.toThrow(/^Command aborted$/)
    expect(output).toHaveLength(0)
  } finally {
    await shell.close()
  }
}
async function closedAndAborted(): Promise<void> {
  const shell = createSupervisedShell()
  await shell.close()
  const operations = new SupervisedBashOperations(shell)
  const signal = new AbortController()
  const output: Buffer[] = []
  const executing = operations.exec(SUPERVISED_TEST_CANCEL_COMMAND, process.cwd(), {
    env: process.env,
    signal: signal.signal,
    onData: output.push.bind(output),
  })
  signal.abort()
  await expect(executing).rejects.toThrow(/^Supervisor de shell encerrado\.$/)
  expect(output).toHaveLength(0)
}

test.each([false, true])(SUPERVISED_TEST_CANCEL_RESULT_ABORT_TITLE, abortedOutput)
test.each([false, true])(SUPERVISED_TEST_CANCEL_RESULT_TIMEOUT_TITLE, timedOutput)
test(SUPERVISED_TEST_IMMEDIATE_ABORT_TITLE, immediateAbort)
test(SUPERVISED_TEST_CLOSED_ABORT_TITLE, closedAndAborted)
