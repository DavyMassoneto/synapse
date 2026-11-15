import { expect, test } from "vitest"
import {
  SHELL_LEASE_INVALID_STOP_TITLE,
  SHELL_LEASE_OUTPUT_STOP_TITLE,
  SHELL_LEASE_TRANSPORT_ACTIVE_TITLE,
  SHELL_LEASE_TRANSPORT_FAILURE,
  SHELL_LEASE_TRANSPORT_STOP_TITLE,
} from "./constants"
import { createWireScenario } from "./create-wire-scenario"

async function invalidWireStillTerminates(): Promise<void> {
  const { lease, owner, status } = await createWireScenario(false)
  status.write(Buffer.from([99]))
  await lease.terminate()
  expect(owner.kills).toBe(1)
}

async function failedOutputStillTerminates(): Promise<void> {
  const { lease, owner, output } = await createWireScenario(true)
  lease.release()
  output.write(Buffer.from([1]))
  await expect(lease.completion).rejects.toThrow()
  await lease.terminate()
  expect(owner.kills).toBe(1)
}

async function transportErrorsDuringStop(channel: number): Promise<void> {
  const { lease, owner, channels } = await createWireScenario(false)
  lease.release()
  const stopped = lease.terminate()
  channels[channel]?.emit("error", new Error(SHELL_LEASE_TRANSPORT_FAILURE))
  await stopped
  expect(owner.kills).toBe(1)
  if (channel === 1) {
    expect(lease.state).toBe("quarantined")
    await expect(lease.completion).rejects.toThrow(SHELL_LEASE_TRANSPORT_FAILURE)
  } else {
    expect(lease.state).toBe("exited")
    expect(await lease.completion).toBe(137)
  }
}

async function transportErrorsBeforeStop(channel: number): Promise<void> {
  const { lease, owner, channels } = await createWireScenario(false)
  channels[channel]?.emit("error", new Error(SHELL_LEASE_TRANSPORT_FAILURE))
  await expect(lease.completion).rejects.toThrow(SHELL_LEASE_TRANSPORT_FAILURE)
  await lease.terminate()
  expect(owner.kills).toBe(1)
}

test.each([0, 1, 2])(SHELL_LEASE_TRANSPORT_STOP_TITLE, transportErrorsDuringStop)
test.each([0, 1, 2])(SHELL_LEASE_TRANSPORT_ACTIVE_TITLE, transportErrorsBeforeStop)
test(SHELL_LEASE_INVALID_STOP_TITLE, invalidWireStillTerminates)
test(SHELL_LEASE_OUTPUT_STOP_TITLE, failedOutputStillTerminates)
