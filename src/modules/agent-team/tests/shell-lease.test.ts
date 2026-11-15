import { ChildProcess } from "node:child_process"
import { PassThrough } from "node:stream"
import { expect, test } from "vitest"
import { SupervisedWireLease } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import { SHELL_LEASE_INVALID_STOP_TITLE, SHELL_LEASE_OUTPUT_STOP_TITLE } from "./constants"
import { ShellWireTestOwner, ShellWireTestSink } from "./shell-wire-support"

async function invalidWireStillTerminates(): Promise<void> {
  const child = new ChildProcess()
  const status = new PassThrough()
  const output = new PassThrough()
  const owner = new ShellWireTestOwner(child, output)
  const lease = new SupervisedWireLease(
    {
      process: child,
      status,
      output,
      input: new PassThrough(),
      requiresEmptyAck: false,
      terminate: owner.terminate.bind(owner),
      confirmEmpty: owner.confirmEmpty.bind(owner),
    },
    new ShellWireTestSink(),
  )
  const ready = lease.ready()
  status.write(Buffer.from([1]))
  await ready
  status.write(Buffer.from([99]))
  await lease.terminate()
  expect(owner.kills).toBe(1)
}

async function failedOutputStillTerminates(): Promise<void> {
  const child = new ChildProcess()
  const status = new PassThrough()
  const output = new PassThrough()
  const owner = new ShellWireTestOwner(child, output)
  const sink = new ShellWireTestSink()
  sink.fail = true
  const lease = new SupervisedWireLease(
    {
      process: child,
      status,
      output,
      input: new PassThrough(),
      requiresEmptyAck: false,
      terminate: owner.terminate.bind(owner),
      confirmEmpty: owner.confirmEmpty.bind(owner),
    },
    sink,
  )
  const ready = lease.ready()
  status.write(Buffer.from([1]))
  await ready
  lease.release()
  output.write(Buffer.from([1]))
  await expect(lease.completion).rejects.toThrow()
  await lease.terminate()
  expect(owner.kills).toBe(1)
}

test(SHELL_LEASE_INVALID_STOP_TITLE, invalidWireStillTerminates)
test(SHELL_LEASE_OUTPUT_STOP_TITLE, failedOutputStillTerminates)
