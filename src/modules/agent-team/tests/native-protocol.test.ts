import { once } from "node:events"
import { expect, test } from "vitest"
import { SHELL_NATIVE_EOF_TITLE, SHELL_NATIVE_INVALID_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { SHELL_TEST_EVENT_DATA } from "./native-fixture-constants"
import { SHELL_TEST_FORBIDDEN_COMMAND, SHELL_TEST_WINDOWS_PLATFORM } from "./native-scenario-constants"
import { NativeTransport } from "./native-transport"

async function eofBeforeRelease(): Promise<void> {
  const transport = await NativeTransport.create(SHELL_TEST_FORBIDDEN_COMMAND)
  try {
    await transport.reservationPid()
    await once(transport.status, SHELL_TEST_EVENT_DATA)
    const result = once(transport.status, SHELL_TEST_EVENT_DATA)
    transport.control.end()
    const frame = await result
    expect(frame[0]).toEqual(Buffer.from([5, 0, 0, 0]))
    expect(await transport.closed()).toBe(0)
    expect(transport.output.readableLength).toBe(0)
  } finally {
    await transport.close()
  }
}
async function invalidBeforeRelease(): Promise<void> {
  const transport = await NativeTransport.create(SHELL_TEST_FORBIDDEN_COMMAND)
  try {
    await transport.reservationPid()
    await once(transport.status, SHELL_TEST_EVENT_DATA)
    const result = once(transport.status, SHELL_TEST_EVENT_DATA)
    transport.control.write(Buffer.from([99]))
    const frame = await result
    expect(Buffer.isBuffer(frame[0])).toBe(true)
    if (Buffer.isBuffer(frame[0])) {
      expect(frame[0][0]).toBe(5)
      expect(frame[0][1]).toBe(1)
    }
    expect(await transport.closed()).toBe(0)
    expect(transport.output.readableLength).toBe(0)
  } finally {
    await transport.close()
  }
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_EOF_TITLE,
  eofBeforeRelease,
  SHELL_NATIVE_TEST_MS,
)
test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_INVALID_TITLE,
  invalidBeforeRelease,
  SHELL_NATIVE_TEST_MS,
)
