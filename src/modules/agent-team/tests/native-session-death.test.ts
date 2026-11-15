import { once } from "node:events"
import { expect, test } from "vitest"
import { SHELL_NATIVE_SESSION_DEATH_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { NativeTransport } from "./native-transport"

async function sessionKeeperDeathIsNotSuccess(): Promise<void> {
  const transport = await NativeTransport.create("exit 0")
  const reservation = await transport.reservationPid()
  await once(transport.status, "data")
  const closed = transport.closed()
  transport.killSessionKeeper()
  transport.eof()
  await expect(closed).rejects.toThrow()
  expect(reservation).toBeGreaterThan(0)
}

test.skipIf(process.platform === "win32")(
  SHELL_NATIVE_SESSION_DEATH_TITLE,
  sessionKeeperDeathIsNotSuccess,
  SHELL_NATIVE_TEST_MS,
)
