import { once } from "node:events"
import { expect, test } from "vitest"
import {
  confirmUnixKeeperClosed,
  terminateUnixKeeper,
} from "#synapse/modules/agent-team/adapters/supervised-shell/unix"
import { SupervisedWireLease } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import {
  SHELL_NATIVE_TEST_MS,
  SHELL_PHASE_BLOCKED_JOIN_TITLE,
  SHELL_PHASE_CLOCK_FAULT_TITLE,
  SHELL_PHASE_IDENTITY_FIELD_SEPARATOR,
  SHELL_PHASE_JOIN_FAILED_TITLE,
  SHELL_PHASE_JOIN_PCT_TITLE,
  SHELL_PHASE_LOST_ACK_TITLE,
  SHELL_PHASE_MARKER_DUPLICATE_TITLE,
  SHELL_PHASE_MARKER_TWO_COMMITS,
  SHELL_PHASE_MODE_CLOCK_ACK,
  SHELL_PHASE_MODE_CLOCK_FAILED,
  SHELL_PHASE_MODE_CLOCK_RUNNING,
  SHELL_PHASE_MODE_CLOCK_STOP,
  SHELL_PHASE_MODE_ESRCH,
  SHELL_PHASE_MODE_JOIN_BLOCKED,
  SHELL_PHASE_MODE_JOIN_FAILURE,
  SHELL_PHASE_MODE_JOIN_NEVER,
  SHELL_PHASE_MODE_JOIN_NEVER_STOP,
  SHELL_PHASE_MODE_OBSERVE,
  SHELL_PHASE_MODE_RESERVATION_DEATH,
  SHELL_PHASE_MODE_SESSION_DEATH,
  SHELL_PHASE_MODE_STATUS_PRESSURE,
  SHELL_PHASE_STATUS_PRESSURE_TITLE,
} from "./constants"
import { NativePhaseScenario } from "./native-phase-scenario"
import { assertSingleCommit } from "./phase-marker"
import { ShellWireTestSink } from "./shell-wire-support"

async function joinFailurePCT(): Promise<void> {
  const scenario = await NativePhaseScenario.create()
  try {
    const keeper = await scenario.start(SHELL_PHASE_MODE_JOIN_FAILURE)
    const lease = new SupervisedWireLease(
      {
        process: keeper.process,
        status: keeper.status,
        output: keeper.output,
        input: keeper.control,
        requiresEmptyAck: true,
        preparationTerminal: true,
        confirmEmpty: confirmUnixKeeperClosed.bind(undefined, keeper.process),
        terminate: terminateUnixKeeper.bind(undefined, keeper.process, keeper.control),
      },
      new ShellWireTestSink(),
    )
    await expect(lease.ready()).rejects.toThrow()
    await expect(lease.completion).rejects.toThrow()
    await lease.terminate()
    expect(lease.state).toBe("exited")
    expect(keeper.output.readableLength).toBe(0)
  } finally {
    await scenario.close()
  }
}

test.skipIf(process.platform === "win32")(SHELL_PHASE_JOIN_PCT_TITLE, joinFailurePCT, SHELL_NATIVE_TEST_MS)

async function failedJoin(): Promise<void> {
  const scenario = await NativePhaseScenario.create()
  try {
    const keeper = await scenario.start(SHELL_PHASE_MODE_JOIN_FAILURE)
    await scenario.marker(SHELL_PHASE_MODE_JOIN_FAILURE)
    expect(await keeper.terminal).toBe(0)
    expect(keeper.statusBytes.subarray(0, 2)).toEqual(Buffer.from([5, 1]))
    expect(keeper.output.readableLength).toBe(0)
  } finally {
    await scenario.close()
  }
}

async function blockedJoin(mode: string): Promise<void> {
  const scenario = await NativePhaseScenario.create()
  try {
    const keeper = await scenario.start(SHELL_PHASE_MODE_JOIN_BLOCKED)
    const identity = (await scenario.marker(SHELL_PHASE_MODE_JOIN_BLOCKED))
      .trim()
      .split(SHELL_PHASE_IDENTITY_FIELD_SEPARATOR)
    const reservation = Number(identity[1])
    const began = Date.now()
    if (mode === SHELL_PHASE_MODE_RESERVATION_DEATH) {
      process.kill(reservation, "SIGKILL")
      expect(await keeper.terminal).toBe(94)
    } else if (mode === SHELL_PHASE_MODE_SESSION_DEATH) {
      const closed = keeper.terminal
      if (!keeper.process.pid) {
        throw new Error(mode)
      }
      process.kill(keeper.process.pid, "SIGKILL")
      await expect(closed).rejects.toThrow()
    } else {
      if (mode === SHELL_PHASE_MODE_JOIN_NEVER_STOP) {
        const frame = Buffer.alloc(9)
        frame[0] = 2
        frame.writeBigUInt64BE(process.hrtime.bigint() + 5000000000n, 1)
        keeper.control.write(frame)
      } else {
        keeper.control.end()
      }
      expect(await keeper.terminal).toBe(0)
      expect(keeper.statusBytes).toEqual(Buffer.from([5, 0, 0, 0]))
    }
    expect(Date.now() - began).toBeLessThan(5500)
    expect(keeper.output.readableLength).toBe(0)
  } finally {
    await scenario.close()
  }
}

test
  .skipIf(process.platform === "win32")
  .each([
    SHELL_PHASE_MODE_RESERVATION_DEATH,
    SHELL_PHASE_MODE_SESSION_DEATH,
    SHELL_PHASE_MODE_JOIN_NEVER,
    SHELL_PHASE_MODE_JOIN_NEVER_STOP,
  ])(SHELL_PHASE_BLOCKED_JOIN_TITLE, blockedJoin, SHELL_NATIVE_TEST_MS)

async function lostAckAfterEmpty(): Promise<void> {
  const scenario = await NativePhaseScenario.create()
  try {
    const keeper = await scenario.start(SHELL_PHASE_MODE_OBSERVE)
    await once(keeper.status, "data")
    keeper.status.destroy()
    keeper.control.write(Buffer.from([2]))
    await scenario.marker(SHELL_PHASE_MODE_ESRCH)
    expect(await keeper.terminal).toBe(94)
    assertSingleCommit(await scenario.marker(SHELL_PHASE_MODE_ESRCH))
    expect(keeper.output.readableLength).toBe(0)
  } finally {
    await scenario.close()
  }
}

test.skipIf(process.platform === "win32")(SHELL_PHASE_LOST_ACK_TITLE, lostAckAfterEmpty, SHELL_NATIVE_TEST_MS)

async function statusPressure(): Promise<void> {
  const scenario = await NativePhaseScenario.create()
  try {
    const keeper = await scenario.start(SHELL_PHASE_MODE_STATUS_PRESSURE)
    await scenario.marker(SHELL_PHASE_MODE_STATUS_PRESSURE)
    const began = Date.now()
    const frame = Buffer.alloc(9)
    frame[0] = 2
    frame.writeBigUInt64BE(process.hrtime.bigint() + 5000000000n, 1)
    keeper.control.write(frame)
    expect(await keeper.terminal).toBe(0)
    expect(Date.now() - began).toBeLessThan(5000)
    expect(keeper.output.readableLength).toBe(0)
    expect(keeper.statusBytes).toEqual(Buffer.from([1, 5, 0, 0, 0]))
    assertSingleCommit(await scenario.marker(SHELL_PHASE_MODE_ESRCH))
  } finally {
    await scenario.close()
  }
}

test.skipIf(process.platform === "win32")(SHELL_PHASE_STATUS_PRESSURE_TITLE, statusPressure, SHELL_NATIVE_TEST_MS)

async function failedClock(mode: string): Promise<void> {
  const scenario = await NativePhaseScenario.create()
  try {
    const keeper = await scenario.start(mode)
    if (mode !== SHELL_PHASE_MODE_CLOCK_RUNNING) {
      await once(keeper.status, "data")
      const frame = Buffer.alloc(9)
      frame[0] = 2
      frame.writeBigUInt64BE(process.hrtime.bigint() + 5000000000n, 1)
      keeper.control.write(frame)
    }
    await scenario.marker(SHELL_PHASE_MODE_CLOCK_FAILED)
    expect(await keeper.terminal).toBe(94)
    expect(keeper.statusBytes.includes(3)).toBe(false)
    expect(keeper.output.readableLength).toBe(0)
  } finally {
    await scenario.close()
  }
}

test
  .skipIf(process.platform === "win32")
  .each([SHELL_PHASE_MODE_CLOCK_RUNNING, SHELL_PHASE_MODE_CLOCK_STOP, SHELL_PHASE_MODE_CLOCK_ACK])(
  SHELL_PHASE_CLOCK_FAULT_TITLE,
  failedClock,
  SHELL_NATIVE_TEST_MS,
)

test.skipIf(process.platform === "win32")(SHELL_PHASE_JOIN_FAILED_TITLE, failedJoin, SHELL_NATIVE_TEST_MS)

function duplicateCommitRejected(): void {
  expect(assertSingleCommit.bind(undefined, SHELL_PHASE_MARKER_TWO_COMMITS)).toThrow()
}

test(SHELL_PHASE_MARKER_DUPLICATE_TITLE, duplicateCommitRejected)
