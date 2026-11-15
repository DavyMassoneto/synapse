import { once } from "node:events"
import { expect, test } from "vitest"
import {
  confirmUnixKeeperClosed,
  terminateUnixKeeper,
} from "#synapse/modules/agent-team/adapters/supervised-shell/unix"
import { SupervisedWireLease } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import { SHELL_NATIVE_LEASE_PAUSED_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { SHELL_TEST_EVENT_DATA } from "./native-fixture-constants"
import {
  SHELL_TEST_FOREGROUND_COMMAND,
  SHELL_TEST_FOREGROUND_OUTPUT,
  SHELL_TEST_WINDOWS_PLATFORM,
} from "./native-scenario-constants"
import { NativeTransport } from "./native-transport"
import { ShellWireTestSink } from "./shell-wire-support"

async function exitBeforeDataReader(): Promise<void> {
  const transport = await NativeTransport.create(SHELL_TEST_FOREGROUND_COMMAND)
  try {
    await transport.reservationPid()
    await once(transport.status, SHELL_TEST_EVENT_DATA)
    transport.output.pause()
    const exit = once(transport.status, SHELL_TEST_EVENT_DATA)
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
    transport.status.emit(SHELL_TEST_EVENT_DATA, Buffer.from([1]))
    await lease.ready()
    lease.release()
    if (Buffer.isBuffer(frame[0])) {
      transport.status.emit(SHELL_TEST_EVENT_DATA, frame[0])
    }
    try {
      expect(await lease.completion).toBe(0)
      expect(sink.bytes).toBe(Buffer.byteLength(SHELL_TEST_FOREGROUND_OUTPUT))
    } finally {
      await lease.terminate()
    }
  } finally {
    await transport.close()
  }
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_LEASE_PAUSED_TITLE,
  exitBeforeDataReader,
  SHELL_NATIVE_TEST_MS,
)
