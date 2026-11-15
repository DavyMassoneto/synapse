import { expect, test } from "vitest"
import { SupervisedShellSupervisor } from "#synapse/modules/agent-team/internal/supervised-shell"
import {
  SHELL_ADMISSION_TEST_SPEC,
  SHELL_FAILED_CREATE_PRESPAWN_TITLE,
  SHELL_FAILED_CREATE_RETIRED_TITLE,
  SHELL_FAILED_CREATE_TEST_WAIT_MS,
  SHELL_FAILED_CREATE_TIMEOUT_TITLE,
  SHELL_FAILED_CREATE_TRACKED_TITLE,
} from "./constants"
import { FailedAdmissionLauncher } from "./failed-admission-support"
import { SHELL_ADMISSION_BEFORE_SPAWN, SHELL_ADMISSION_FAILURE_MODES } from "./native-fixture-constants"
import { ShellWireTestSink } from "./shell-wire-support"

async function failedCreateRetainsOwnership(mode: string): Promise<void> {
  const launcher = new FailedAdmissionLauncher()
  launcher.failedConfirmation = true
  launcher.failureMode = mode
  const supervisor = new SupervisedShellSupervisor(launcher)
  await expect(supervisor.create(SHELL_ADMISSION_TEST_SPEC, new ShellWireTestSink())).rejects.toThrow()
  await expect(supervisor.stop()).rejects.toThrow()
  await expect(supervisor.stop()).rejects.toThrow()
  expect(launcher.scenario.kills).toBe(1)
  expect(launcher.scenario.confirmations).toBe(1)
  expect(launcher.scenario.lease.state).toBe("quarantined")
}
async function cleanFailedCreateRetires(): Promise<void> {
  const launcher = new FailedAdmissionLauncher()
  const supervisor = new SupervisedShellSupervisor(launcher)
  await expect(supervisor.create(SHELL_ADMISSION_TEST_SPEC, new ShellWireTestSink())).rejects.toThrow()
  await supervisor.stop()
  expect(launcher.scenario.kills).toBe(1)
  expect(launcher.scenario.confirmations).toBe(1)
}
async function beforeSpawnRetires(): Promise<void> {
  const launcher = new FailedAdmissionLauncher()
  launcher.beforeSpawn = true
  const supervisor = new SupervisedShellSupervisor(launcher)
  await expect(supervisor.create(SHELL_ADMISSION_TEST_SPEC, new ShellWireTestSink())).rejects.toThrow(
    SHELL_ADMISSION_BEFORE_SPAWN,
  )
  await supervisor.close()
  expect(launcher.scenario.kills).toBe(0)
  launcher.scenario.synchronousClose = true
  await launcher.scenario.prepare()
  await launcher.scenario.lease.terminate()
}

async function failedCreateTimedOutOwnership(): Promise<void> {
  const launcher = new FailedAdmissionLauncher()
  launcher.pendingConfirmation = true
  const supervisor = new SupervisedShellSupervisor(launcher)
  await expect(supervisor.create(SHELL_ADMISSION_TEST_SPEC, new ShellWireTestSink())).rejects.toThrow()
  await expect(supervisor.stop()).rejects.toThrow()
  expect(launcher.scenario.kills).toBe(1)
  expect(launcher.scenario.lease.state).toBe("quarantined")
  launcher.scenario.confirm()
}

test(SHELL_FAILED_CREATE_TIMEOUT_TITLE, failedCreateTimedOutOwnership, SHELL_FAILED_CREATE_TEST_WAIT_MS)
test.each(SHELL_ADMISSION_FAILURE_MODES)(SHELL_FAILED_CREATE_TRACKED_TITLE, failedCreateRetainsOwnership)
test(SHELL_FAILED_CREATE_RETIRED_TITLE, cleanFailedCreateRetires)
test(SHELL_FAILED_CREATE_PRESPAWN_TITLE, beforeSpawnRetires)
