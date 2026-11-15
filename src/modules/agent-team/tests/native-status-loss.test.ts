import { once } from "node:events"
import { expect, test } from "vitest"
import { SHELL_NATIVE_STATUS_LOSS_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { NativeTransport } from "./native-transport"

async function lostStatusDoesNotAcknowledge(): Promise<void> {
  const transport = await NativeTransport.create("exit 0")
  await transport.reservationPid()
  await once(transport.status, "data")
  transport.closeStatus()
  transport.eof()
  expect(await transport.closed()).not.toBe(0)
}

test.skipIf(process.platform === "win32")(
  SHELL_NATIVE_STATUS_LOSS_TITLE,
  lostStatusDoesNotAcknowledge,
  SHELL_NATIVE_TEST_MS,
)
