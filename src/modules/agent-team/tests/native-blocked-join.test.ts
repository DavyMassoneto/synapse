import { expect, test } from "vitest"
import {
  SHELL_NATIVE_TEST_MS,
  SHELL_PHASE_IDENTITY_FIELD_SEPARATOR,
  SHELL_PHASE_JOIN_EOF_TITLE,
  SHELL_PHASE_JOIN_STOP_TITLE,
  SHELL_PHASE_MODE_ESRCH,
  SHELL_PHASE_MODE_JOIN_BLOCKED,
  SHELL_PHASE_MODE_SESSION_DEATH,
  SHELL_PHASE_RESERVATION_DEATH_TITLE,
  SHELL_PHASE_SESSION_DEATH_TITLE,
} from "./constants"
import { SHELL_TEST_SIGNAL_KILL } from "./native-fixture-constants"
import { NativePhaseScenario } from "./native-phase-scenario"
import { SHELL_TEST_WINDOWS_PLATFORM } from "./native-scenario-constants"

async function blockedJoinReservationDeath(): Promise<void> {
  const scenario = await NativePhaseScenario.create()
  try {
    const keeper = await scenario.start(SHELL_PHASE_MODE_JOIN_BLOCKED)
    const identity = (await scenario.marker(SHELL_PHASE_MODE_JOIN_BLOCKED))
      .trim()
      .split(SHELL_PHASE_IDENTITY_FIELD_SEPARATOR)
    const began = Date.now()
    process.kill(Number(identity[1]), SHELL_TEST_SIGNAL_KILL)
    expect(await keeper.terminal).toBe(94)
    expect(Date.now() - began).toBeLessThan(5500)
    expect(keeper.output.readableLength).toBe(0)
  } finally {
    await scenario.close()
  }
}

async function blockedJoinSessionDeath(): Promise<void> {
  const scenario = await NativePhaseScenario.create()
  try {
    const keeper = await scenario.start(SHELL_PHASE_MODE_JOIN_BLOCKED)
    await scenario.marker(SHELL_PHASE_MODE_JOIN_BLOCKED)
    const began = Date.now()
    const closed = keeper.terminal
    if (!keeper.process.pid) {
      throw new Error(SHELL_PHASE_MODE_SESSION_DEATH)
    }
    process.kill(keeper.process.pid, SHELL_TEST_SIGNAL_KILL)
    await expect(closed).rejects.toThrow()
    await scenario.marker(SHELL_PHASE_MODE_ESRCH)
    expect(Date.now() - began).toBeLessThan(5500)
    expect(keeper.output.readableLength).toBe(0)
  } finally {
    await scenario.close()
  }
}

async function blockedJoinControl(stop: boolean): Promise<void> {
  const scenario = await NativePhaseScenario.create()
  try {
    const keeper = await scenario.start(SHELL_PHASE_MODE_JOIN_BLOCKED)
    await scenario.marker(SHELL_PHASE_MODE_JOIN_BLOCKED)
    const began = Date.now()
    if (stop) {
      const frame = Buffer.alloc(9)
      frame[0] = 2
      frame.writeBigUInt64BE(process.hrtime.bigint() + 5000000000n, 1)
      keeper.control.write(frame)
    } else {
      keeper.control.end()
    }
    expect(await keeper.terminal).toBe(0)
    expect(keeper.statusBytes).toEqual(Buffer.from([5, 0, 0, 0]))
    expect(Date.now() - began).toBeLessThan(5500)
    expect(keeper.output.readableLength).toBe(0)
  } finally {
    await scenario.close()
  }
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_PHASE_RESERVATION_DEATH_TITLE,
  blockedJoinReservationDeath,
  SHELL_NATIVE_TEST_MS,
)
test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_PHASE_SESSION_DEATH_TITLE,
  blockedJoinSessionDeath,
  SHELL_NATIVE_TEST_MS,
)
test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_PHASE_JOIN_EOF_TITLE,
  blockedJoinControl.bind(undefined, false),
  SHELL_NATIVE_TEST_MS,
)
test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_PHASE_JOIN_STOP_TITLE,
  blockedJoinControl.bind(undefined, true),
  SHELL_NATIVE_TEST_MS,
)
