import { ChildProcess } from "node:child_process"
import { PassThrough } from "node:stream"
import { expect, test, vi } from "vitest"
import { SupervisedWireLease } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import { SHELL_NATIVE_LATE_ACK_TITLE } from "./constants"
import { SHELL_TEST_CLOCK_METHOD, SHELL_TEST_STATE_QUARANTINED } from "./native-scenario-constants"
import { ShellWireTestOwner, ShellWireTestSink } from "./shell-wire-support"

async function lateAckBeforeTimer(): Promise<void> {
  const process = new ChildProcess()
  const status = new PassThrough()
  const output = new PassThrough()
  const owner = new ShellWireTestOwner(process, output)
  const lease = new SupervisedWireLease(
    {
      process,
      status,
      output,
      input: new PassThrough(),
      requiresEmptyAck: true,
      preparationTerminal: true,
      confirmEmpty: owner.confirmEmpty.bind(owner),
      terminate: owner.terminate.bind(owner),
    },
    new ShellWireTestSink(),
  )
  const ready = lease.ready()
  status.write(Buffer.from([1]))
  await ready
  const stopped = lease.terminate()
  const clock = vi
    .spyOn(globalThis.process.hrtime, SHELL_TEST_CLOCK_METHOD)
    .mockReturnValue(globalThis.process.hrtime.bigint() + 6000000000n)
  try {
    status.write(Buffer.from([5, 0, 0, 0]))
    await expect(stopped).rejects.toThrow()
    await expect(lease.completion).rejects.toThrow()
    expect(lease.state).toBe(SHELL_TEST_STATE_QUARANTINED)
  } finally {
    clock.mockRestore()
  }
}

test(SHELL_NATIVE_LATE_ACK_TITLE, lateAckBeforeTimer)
