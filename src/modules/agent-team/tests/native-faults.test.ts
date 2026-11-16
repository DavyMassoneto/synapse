import { once } from "node:events"
import { setTimeout } from "node:timers/promises"
import { expect, test } from "vitest"
import {
  SHELL_NATIVE_DEATH_TITLE,
  SHELL_NATIVE_EXPIRED_TITLE,
  SHELL_NATIVE_FROZEN_TITLE,
  SHELL_NATIVE_TEST_MS,
} from "./constants"
import { SHELL_NATIVE_RESUME_DELAY_MS, SHELL_TEST_EVENT_DATA, SHELL_TEST_SIGNAL_KILL } from "./native-fixture-constants"
import {
  SHELL_TEST_EXIT_ZERO_COMMAND,
  SHELL_TEST_SIGNAL_CONTINUE,
  SHELL_TEST_SIGNAL_STOP,
  SHELL_TEST_WINDOWS_PLATFORM,
} from "./native-scenario-constants"
import { NativeTransport } from "./native-transport"

async function reservationDeath(): Promise<void> {
  const transport = await NativeTransport.create(SHELL_TEST_EXIT_ZERO_COMMAND)
  try {
    const pid = await transport.reservationPid()
    await once(transport.status, SHELL_TEST_EVENT_DATA)
    const closed = transport.closed()
    process.kill(pid, SHELL_TEST_SIGNAL_KILL)
    expect(await closed).not.toBe(0)
  } finally {
    await transport.close()
  }
}
async function expiredDeadline(): Promise<void> {
  const transport = await NativeTransport.create(SHELL_TEST_EXIT_ZERO_COMMAND)
  try {
    await transport.reservationPid()
    await once(transport.status, SHELL_TEST_EVENT_DATA)
    const closed = transport.closed()
    transport.stop(process.hrtime.bigint() - 1n)
    expect(await closed).not.toBe(0)
  } finally {
    await transport.close()
  }
}
async function frozenReservation(): Promise<void> {
  const transport = await NativeTransport.create(SHELL_TEST_EXIT_ZERO_COMMAND)
  try {
    const pid = await transport.reservationPid()
    await once(transport.status, SHELL_TEST_EVENT_DATA)
    process.kill(pid, SHELL_TEST_SIGNAL_STOP)
    try {
      transport.stop(process.hrtime.bigint() + 1000000n)
      await setTimeout(SHELL_NATIVE_RESUME_DELAY_MS)
    } finally {
      process.kill(pid, SHELL_TEST_SIGNAL_CONTINUE)
    }
    expect(await transport.closed()).not.toBe(0)
  } finally {
    await transport.close()
  }
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_DEATH_TITLE,
  reservationDeath,
  SHELL_NATIVE_TEST_MS,
)
test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_EXPIRED_TITLE,
  expiredDeadline,
  SHELL_NATIVE_TEST_MS,
)
test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_FROZEN_TITLE,
  frozenReservation,
  SHELL_NATIVE_TEST_MS,
)
