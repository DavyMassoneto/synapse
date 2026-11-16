import { once } from "node:events"
import { expect, test } from "vitest"
import { SHELL_NATIVE_SESSION_DEATH_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { SHELL_TEST_EVENT_DATA } from "./native-fixture-constants"
import { SHELL_TEST_EXIT_ZERO_COMMAND, SHELL_TEST_WINDOWS_PLATFORM } from "./native-scenario-constants"
import { NativeTransport } from "./native-transport"

async function sessionKeeperDeathIsNotSuccess(): Promise<void> {
  const transport = await NativeTransport.create(SHELL_TEST_EXIT_ZERO_COMMAND)
  try {
    const reservation = await transport.reservationPid()
    await once(transport.status, SHELL_TEST_EVENT_DATA)
    const closed = transport.closed()
    transport.killSessionKeeper()
    transport.control.end()
    await expect(closed).rejects.toThrow()
    expect(reservation).toBeGreaterThan(0)
  } finally {
    await transport.close()
  }
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_SESSION_DEATH_TITLE,
  sessionKeeperDeathIsNotSuccess,
  SHELL_NATIVE_TEST_MS,
)
