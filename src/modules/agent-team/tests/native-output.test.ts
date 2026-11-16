import { once } from "node:events"
import { expect, test } from "vitest"
import { SHELL_NATIVE_PAUSED_OUTPUT_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { SHELL_TEST_EVENT_DATA } from "./native-fixture-constants"
import {
  SHELL_TEST_FOREGROUND_COMMAND,
  SHELL_TEST_FOREGROUND_OUTPUT,
  SHELL_TEST_WINDOWS_PLATFORM,
} from "./native-scenario-constants"
import { NativeTransport } from "./native-transport"

async function pausedOutputBeforeExit(): Promise<void> {
  const transport = await NativeTransport.create(SHELL_TEST_FOREGROUND_COMMAND)
  try {
    await transport.reservationPid()
    await once(transport.status, SHELL_TEST_EVENT_DATA)
    transport.output.pause()
    const status = once(transport.status, SHELL_TEST_EVENT_DATA)
    transport.release()
    const frame = await status
    expect(Buffer.isBuffer(frame[0])).toBe(true)
    if (Buffer.isBuffer(frame[0])) {
      expect(frame[0][0]).toBe(2)
    }
    const data = once(transport.output, SHELL_TEST_EVENT_DATA)
    transport.output.resume()
    const bytes = await data
    expect(bytes[0]).toEqual(Buffer.from(SHELL_TEST_FOREGROUND_OUTPUT))
    transport.stop(process.hrtime.bigint() + 5000000000n)
    expect(await transport.closed()).toBe(0)
  } finally {
    await transport.close()
  }
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_PAUSED_OUTPUT_TITLE,
  pausedOutputBeforeExit,
  SHELL_NATIVE_TEST_MS,
)
