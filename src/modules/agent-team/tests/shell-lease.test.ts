import { ChildProcess } from "node:child_process"
import { PassThrough } from "node:stream"
import { expect, test } from "vitest"
import { SupervisedWireLease } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import {
  SHELL_LEASE_INVALID_STOP_TITLE,
  SHELL_LEASE_OUTPUT_STOP_TITLE,
  SHELL_LEASE_TRANSPORT_ACTIVE_TITLE,
  SHELL_LEASE_TRANSPORT_FAILURE,
  SHELL_LEASE_TRANSPORT_STOP_TITLE,
} from "./constants"
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

async function transportErrorsDuringStop(channel: number): Promise<void> {
  const child = new ChildProcess()
  const status = new PassThrough()
  const output = new PassThrough()
  const input = new PassThrough()
  const owner = new ShellWireTestOwner(child, output)
  const channels = [status, output, input]
  const lease = new SupervisedWireLease(
    {
      process: child,
      status,
      output,
      input,
      requiresEmptyAck: false,
      terminate: owner.terminate.bind(owner),
      confirmEmpty: owner.confirmEmpty.bind(owner),
    },
    new ShellWireTestSink(),
  )
  const ready = lease.ready()
  status.write(Buffer.from([1]))
  await ready
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
  const child = new ChildProcess()
  const status = new PassThrough()
  const output = new PassThrough()
  const input = new PassThrough()
  const owner = new ShellWireTestOwner(child, output)
  const channels = [status, output, input]
  const lease = new SupervisedWireLease(
    {
      process: child,
      status,
      output,
      input,
      requiresEmptyAck: false,
      terminate: owner.terminate.bind(owner),
      confirmEmpty: owner.confirmEmpty.bind(owner),
    },
    new ShellWireTestSink(),
  )
  const ready = lease.ready()
  status.write(Buffer.from([1]))
  await ready
  channels[channel]?.emit("error", new Error(SHELL_LEASE_TRANSPORT_FAILURE))
  await expect(lease.completion).rejects.toThrow(SHELL_LEASE_TRANSPORT_FAILURE)
  await lease.terminate()
  expect(owner.kills).toBe(1)
}

test.each([0, 1, 2])(SHELL_LEASE_TRANSPORT_STOP_TITLE, transportErrorsDuringStop)
test.each([0, 1, 2])(SHELL_LEASE_TRANSPORT_ACTIVE_TITLE, transportErrorsBeforeStop)
test(SHELL_LEASE_INVALID_STOP_TITLE, invalidWireStillTerminates)
test(SHELL_LEASE_OUTPUT_STOP_TITLE, failedOutputStillTerminates)
