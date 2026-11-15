import { once } from "node:events"
import { expect, test } from "vitest"
import { SHELL_NATIVE_PAUSED_OUTPUT_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { NativeTransport } from "./native-transport"

async function pausedOutputBeforeExit(): Promise<void> {
  const transport = await NativeTransport.create("printf foreground")
  await transport.reservationPid()
  await once(transport.status, "data")
  transport.output.pause()
  const status = once(transport.status, "data")
  transport.release()
  const frame = await status
  expect(Buffer.isBuffer(frame[0])).toBe(true)
  if (Buffer.isBuffer(frame[0])) {
    expect(frame[0][0]).toBe(2)
  }
  const data = once(transport.output, "data")
  transport.output.resume()
  const bytes = await data
  expect(bytes[0]).toEqual(Buffer.from("foreground"))
  transport.stop(process.hrtime.bigint() + 5000000000n)
  expect(await transport.closed()).toBe(0)
}

test.skipIf(process.platform === "win32")(
  SHELL_NATIVE_PAUSED_OUTPUT_TITLE,
  pausedOutputBeforeExit,
  SHELL_NATIVE_TEST_MS,
)
