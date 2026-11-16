import { once } from "node:events"
import { expect, test } from "vitest"
import { SHELL_NATIVE_STOP_PRIORITY_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { SHELL_TEST_EVENT_DATA } from "./native-fixture-constants"
import {
  SHELL_TEST_FORBIDDEN_COMMAND,
  SHELL_TEST_SIGNAL_CONTINUE,
  SHELL_TEST_SIGNAL_STOP,
  SHELL_TEST_WINDOWS_PLATFORM,
} from "./native-scenario-constants"
import { NativeTransport } from "./native-transport"

async function stopWinsQueuedRelease(): Promise<void> {
  const transport = await NativeTransport.create(SHELL_TEST_FORBIDDEN_COMMAND)
  try {
    const pid = await transport.reservationPid()
    await once(transport.status, SHELL_TEST_EVENT_DATA)
    process.kill(pid, SHELL_TEST_SIGNAL_STOP)
    const response = once(transport.status, SHELL_TEST_EVENT_DATA)
    try {
      transport.release()
      transport.stop(process.hrtime.bigint() + 5000000000n)
    } finally {
      process.kill(pid, SHELL_TEST_SIGNAL_CONTINUE)
    }
    const frame = await response
    expect(frame[0]).toEqual(Buffer.from([5, 0, 0, 0]))
    expect(await transport.closed()).toBe(0)
    expect(transport.output.readableLength).toBe(0)
  } finally {
    await transport.close()
  }
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_STOP_PRIORITY_TITLE,
  stopWinsQueuedRelease,
  SHELL_NATIVE_TEST_MS,
)
