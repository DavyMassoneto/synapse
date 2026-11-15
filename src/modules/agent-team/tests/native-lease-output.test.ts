import { once } from "node:events"
import { expect, test } from "vitest"
import {
  confirmUnixKeeperClosed,
  terminateUnixKeeper,
} from "#synapse/modules/agent-team/adapters/supervised-shell/unix"
import { SupervisedWireLease } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import { SHELL_NATIVE_LEASE_PAUSED_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { NativeTransport } from "./native-transport"
import { ShellWireTestSink } from "./shell-wire-support"

async function exitBeforeDataReader(): Promise<void> {
  const transport = await NativeTransport.create("printf foreground")
  await transport.reservationPid()
  await once(transport.status, "data")
  transport.output.pause()
  const exit = once(transport.status, "data")
  transport.release()
  const frame = await exit
  const sink = new ShellWireTestSink()
  const lease = new SupervisedWireLease(
    {
      process: transport.process,
      status: transport.status,
      output: transport.output,
      input: transport.control,
      requiresEmptyAck: true,
      confirmEmpty: confirmUnixKeeperClosed.bind(undefined, transport.process),
      terminate: terminateUnixKeeper.bind(undefined, transport.process, transport.control),
    },
    sink,
  )
  transport.status.emit("data", Buffer.from([1]))
  await lease.ready()
  lease.release()
  if (Buffer.isBuffer(frame[0])) {
    transport.status.emit("data", frame[0])
  }
  try {
    expect(await lease.completion).toBe(0)
    expect(sink.bytes).toBe(Buffer.byteLength("foreground"))
  } finally {
    await lease.terminate()
  }
}

test.skipIf(process.platform === "win32")(SHELL_NATIVE_LEASE_PAUSED_TITLE, exitBeforeDataReader, SHELL_NATIVE_TEST_MS)
