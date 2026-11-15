import { once } from "node:events"
import { expect, test } from "vitest"
import { SHELL_NATIVE_STATUS_LOSS_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { SHELL_TEST_EVENT_DATA } from "./native-fixture-constants"
import { SHELL_TEST_EXIT_ZERO_COMMAND, SHELL_TEST_WINDOWS_PLATFORM } from "./native-scenario-constants"
import { NativeTransport } from "./native-transport"

async function lostStatusDoesNotAcknowledge(): Promise<void> {
  const transport = await NativeTransport.create(SHELL_TEST_EXIT_ZERO_COMMAND)
  try {
    await transport.reservationPid()
    await once(transport.status, SHELL_TEST_EVENT_DATA)
    transport.status.destroy()
    transport.control.end()
    expect(await transport.closed()).not.toBe(0)
  } finally {
    await transport.close()
  }
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_STATUS_LOSS_TITLE,
  lostStatusDoesNotAcknowledge,
  SHELL_NATIVE_TEST_MS,
)
