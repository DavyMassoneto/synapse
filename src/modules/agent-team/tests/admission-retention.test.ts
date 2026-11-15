import { expect, test } from "vitest"
import { SupervisedShellSupervisor } from "#synapse/modules/agent-team/internal/supervised-shell"
import { AdmissionLauncher } from "./admission-support"
import {
  SHELL_ADMISSION_BACKGROUND_TITLE,
  SHELL_ADMISSION_QUARANTINE_TITLE,
  SHELL_ADMISSION_RETIRED_TITLE,
  SHELL_ADMISSION_TEST_SPEC,
} from "./constants"
import { ShellWireTestSink } from "./shell-wire-support"

async function confirmedLeasesRetire(): Promise<void> {
  const launcher = new AdmissionLauncher()
  const supervisor = new SupervisedShellSupervisor(launcher)
  const lease = await supervisor.create(SHELL_ADMISSION_TEST_SPEC, new ShellWireTestSink())
  await lease.terminate()
  await supervisor.stop()
  expect(launcher.scenarios[0]?.kills).toBe(1)
  expect(lease.state).toBe("exited")
}
async function backgroundStaysTracked(): Promise<void> {
  const launcher = new AdmissionLauncher()
  const supervisor = new SupervisedShellSupervisor(launcher)
  const lease = await supervisor.create(SHELL_ADMISSION_TEST_SPEC, new ShellWireTestSink())
  lease.release()
  launcher.scenarios[0]?.result(0)
  expect(await lease.completion).toBe(0)
  expect(launcher.scenarios[0]?.kills).toBe(0)
  await supervisor.stop()
  expect(launcher.scenarios[0]?.kills).toBe(1)
  expect(lease.state).toBe("exited")
}
async function quarantineRemainsTracked(): Promise<void> {
  const launcher = new AdmissionLauncher()
  const supervisor = new SupervisedShellSupervisor(launcher)
  const lease = await supervisor.create(SHELL_ADMISSION_TEST_SPEC, new ShellWireTestSink())
  const scenario = launcher.scenarios[0]
  if (scenario) {
    scenario.confirmationFails = true
  }
  await expect(lease.terminate()).rejects.toThrow()
  await expect(supervisor.stop()).rejects.toThrow()
  expect(lease.state).toBe("quarantined")
  expect(launcher.scenarios[0]?.kills).toBe(1)
}

test(SHELL_ADMISSION_RETIRED_TITLE, confirmedLeasesRetire)
test(SHELL_ADMISSION_BACKGROUND_TITLE, backgroundStaysTracked)
test(SHELL_ADMISSION_QUARANTINE_TITLE, quarantineRemainsTracked)
