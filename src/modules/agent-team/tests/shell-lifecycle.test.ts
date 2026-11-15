import { setImmediate } from "node:timers/promises"
import { expect, test } from "vitest"
import {
  SHELL_LEASE_TRANSPORT_FAILURE,
  SHELL_MATRIX_ABORT_TITLE,
  SHELL_MATRIX_CONFIRM_TITLE,
  SHELL_MATRIX_EOF_TITLE,
  SHELL_MATRIX_NOACK_TITLE,
  SHELL_MATRIX_NORMAL_TITLE,
  SHELL_MATRIX_PENDING_TITLE,
  SHELL_MATRIX_READY_FAILURE_TITLE,
  SHELL_MATRIX_READY_TITLE,
  SHELL_MATRIX_SINK_TITLE,
  SHELL_MATRIX_STOP_OUTPUT_TITLE,
  SHELL_MATRIX_SYNC_TITLE,
} from "./constants"
import { ShellLifecycleScenario } from "./shell-lifecycle-support"

async function incompleteEof(windows: boolean): Promise<void> {
  const scenario = new ShellLifecycleScenario(windows)
  await scenario.prepare()
  scenario.lease.release()
  scenario.result(10)
  scenario.output.end()
  await expect(scenario.lease.completion).rejects.toThrow()
  const stopped = scenario.lease.terminate()
  scenario.close(windows)
  await stopped
  expect(scenario.confirmations).toBe(1)
}
async function outputDestroyedDuringStop(windows: boolean): Promise<void> {
  const scenario = new ShellLifecycleScenario(windows)
  await scenario.prepare()
  scenario.lease.release()
  scenario.result(10)
  const stopped = scenario.lease.terminate()
  scenario.output.destroy(new Error(SHELL_LEASE_TRANSPORT_FAILURE))
  await expect(scenario.lease.completion).rejects.toThrow(SHELL_LEASE_TRANSPORT_FAILURE)
  scenario.close(windows)
  await stopped
  expect(scenario.confirmations).toBe(1)
  expect(scenario.lease.state).toBe("quarantined")
}
async function confirmFailureRejectsSynthetic(windows: boolean): Promise<void> {
  const scenario = new ShellLifecycleScenario(windows)
  scenario.confirmationFails = true
  await scenario.prepare()
  scenario.lease.release()
  const stopped = scenario.lease.terminate()
  if (windows) {
    scenario.result(0)
  }
  scenario.close(windows)
  await expect(stopped).rejects.toThrow(SHELL_LEASE_TRANSPORT_FAILURE)
  await expect(scenario.lease.completion).rejects.toThrow()
  expect(scenario.lease.state).toBe("quarantined")
}
async function confirmationBeforeExited(windows: boolean): Promise<void> {
  const scenario = new ShellLifecycleScenario(windows)
  scenario.confirmationPending = true
  scenario.sinkPending = true
  await scenario.prepare()
  scenario.lease.release()
  scenario.output.write(Buffer.alloc(10))
  scenario.result(10)
  await setImmediate()
  const stopped = scenario.lease.terminate()
  scenario.close(windows)
  await setImmediate()
  expect(scenario.lease.state).not.toBe("exited")
  scenario.confirm()
  await stopped
  await expect(scenario.lease.completion).rejects.toThrow()
  scenario.deliver()
}
async function readyAndRevocation(): Promise<void> {
  const scenario = new ShellLifecycleScenario(false)
  expect(scenario.lease.ready()).toBe(scenario.lease.ready())
  await scenario.prepare()
  const stopped = scenario.lease.terminate()
  expect(() => scenario.lease.release()).toThrow()
  expect(scenario.input.readableLength).toBe(0)
  scenario.close(false)
  await stopped
  expect(await scenario.lease.completion).toBe(137)
}
async function abortPreparation(): Promise<void> {
  const cancellation = new AbortController()
  const scenario = new ShellLifecycleScenario(false, cancellation.signal)
  const ready = scenario.lease.ready()
  cancellation.abort()
  const stopped = scenario.lease.terminate()
  scenario.close(false)
  await expect(ready).rejects.toThrow()
  await stopped
  expect(() => scenario.lease.release()).toThrow()
  expect(scenario.kills).toBe(1)
  expect(await scenario.lease.completion).toBe(137)
}
async function missingEmptyAck(): Promise<void> {
  const scenario = new ShellLifecycleScenario(true)
  await scenario.prepare()
  scenario.lease.release()
  const stopped = scenario.lease.terminate()
  scenario.close(false)
  await expect(stopped).rejects.toThrow()
  await expect(scenario.lease.completion).rejects.toThrow()
  expect(scenario.lease.state).toBe("quarantined")
}

async function normalResultBeforeFailedStop(windows: boolean): Promise<void> {
  const scenario = new ShellLifecycleScenario(windows)
  await scenario.prepare()
  scenario.lease.release()
  scenario.result(0)
  expect(await scenario.lease.completion).toBe(0)
  scenario.confirmationFails = true
  const stopped = scenario.lease.terminate()
  scenario.close(windows)
  await expect(stopped).rejects.toThrow(SHELL_LEASE_TRANSPORT_FAILURE)
  expect(await scenario.lease.completion).toBe(0)
  expect(scenario.lease.state).toBe("quarantined")
}
async function sinkRejectDuringStop(windows: boolean): Promise<void> {
  const scenario = new ShellLifecycleScenario(windows)
  scenario.sinkPending = true
  await scenario.prepare()
  scenario.lease.release()
  scenario.output.write(Buffer.alloc(10))
  scenario.result(10)
  await setImmediate()
  const stopped = scenario.lease.terminate()
  scenario.rejectDelivery()
  await expect(scenario.lease.completion).rejects.toThrow(SHELL_LEASE_TRANSPORT_FAILURE)
  scenario.close(windows)
  await stopped
  expect(scenario.lease.state).toBe("quarantined")
}

async function readyNeverRevives(): Promise<void> {
  const scenario = new ShellLifecycleScenario(false)
  await scenario.prepare()
  scenario.status.write(Buffer.from([99]))
  const ready = scenario.lease.ready()
  expect(scenario.lease.ready()).toBe(ready)
  await expect(ready).rejects.toThrow()
  expect(() => scenario.lease.release()).toThrow()
  expect(scenario.input.readableLength).toBe(0)
  const stopped = scenario.lease.terminate()
  scenario.close(false)
  await stopped
  expect(scenario.lease.state).toBe("quarantined")
}
async function synchronousClose(): Promise<void> {
  const scenario = new ShellLifecycleScenario(false)
  scenario.synchronousClose = true
  await scenario.prepare()
  await scenario.lease.terminate()
  expect(scenario.confirmations).toBe(1)
  expect(scenario.lease.state).toBe("exited")
  expect(await scenario.lease.completion).toBe(137)
}

test(SHELL_MATRIX_READY_FAILURE_TITLE, readyNeverRevives)
test(SHELL_MATRIX_SYNC_TITLE, synchronousClose)
test.each([false, true])(SHELL_MATRIX_NORMAL_TITLE, normalResultBeforeFailedStop)
test.each([false, true])(SHELL_MATRIX_SINK_TITLE, sinkRejectDuringStop)
test.each([false, true])(SHELL_MATRIX_EOF_TITLE, incompleteEof)
test.each([false, true])(SHELL_MATRIX_STOP_OUTPUT_TITLE, outputDestroyedDuringStop)
test.each([false, true])(SHELL_MATRIX_CONFIRM_TITLE, confirmFailureRejectsSynthetic)
test.each([false, true])(SHELL_MATRIX_PENDING_TITLE, confirmationBeforeExited)
test(SHELL_MATRIX_READY_TITLE, readyAndRevocation)
test(SHELL_MATRIX_ABORT_TITLE, abortPreparation)
test(SHELL_MATRIX_NOACK_TITLE, missingEmptyAck)
