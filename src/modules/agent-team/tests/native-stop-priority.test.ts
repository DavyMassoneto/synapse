import { once } from "node:events"
import { expect, test } from "vitest"
import { SHELL_NATIVE_STOP_PRIORITY_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { NativeTransport } from "./native-transport"

async function stopWinsQueuedRelease(): Promise<void> {
  const transport = await NativeTransport.create("printf forbidden")
  const pid = await transport.reservationPid()
  await once(transport.status, "data")
  process.kill(pid, "SIGSTOP")
  const response = once(transport.status, "data")
  transport.release()
  transport.stop(process.hrtime.bigint() + 5000000000n)
  process.kill(pid, "SIGCONT")
  const frame = await response
  expect(frame[0]).toEqual(Buffer.from([5, 0, 0, 0]))
  expect(await transport.closed()).toBe(0)
  expect(transport.output.readableLength).toBe(0)
}

test.skipIf(process.platform === "win32")(SHELL_NATIVE_STOP_PRIORITY_TITLE, stopWinsQueuedRelease, SHELL_NATIVE_TEST_MS)
