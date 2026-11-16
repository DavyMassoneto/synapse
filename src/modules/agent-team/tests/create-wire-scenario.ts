import { ChildProcess } from "node:child_process"
import { PassThrough } from "node:stream"
import { SupervisedWireLease } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import { ShellWireTestOwner, ShellWireTestSink } from "./shell-wire-support"
import { type ShellWireScenario } from "./types"

export async function createWireScenario(failedSink: boolean): Promise<ShellWireScenario> {
  const child = new ChildProcess()
  const status = new PassThrough()
  const output = new PassThrough()
  const input = new PassThrough()
  const owner = new ShellWireTestOwner(child, output)
  const sink = new ShellWireTestSink()
  sink.fail = failedSink
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
    sink,
  )
  const ready = lease.ready()
  status.write(Buffer.from([1]))
  await ready
  return { lease, owner, status, output, input, channels: [status, output, input] }
}
