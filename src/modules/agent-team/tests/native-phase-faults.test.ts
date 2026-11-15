import { once } from "node:events"
import { expect, test } from "vitest"
import {
  confirmUnixKeeperClosed,
  terminateUnixKeeper,
} from "#synapse/modules/agent-team/adapters/supervised-shell/unix"
import { SupervisedWireLease } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
import {
  SHELL_NATIVE_TEST_MS,
  SHELL_PHASE_JOIN_FAILED_TITLE,
  SHELL_PHASE_MARKER_DUPLICATE_TITLE,
  SHELL_PHASE_MARKER_TWO_COMMITS,
  SHELL_SCENARIO_,
  SHELL_SCENARIO_ACK_PERDIDO_DEPOIS_DO_ESRCH_N_O_VIRA_SUCESSO_DO_KEEPER,
  SHELL_SCENARIO_CLOCK_ACK,
  SHELL_SCENARIO_CLOCK_FAILED,
  SHELL_SCENARIO_CLOCK_RUNNING,
  SHELL_SCENARIO_CLOCK_STOP,
  SHELL_SCENARIO_ESRCH,
  SHELL_SCENARIO_JOIN_BLOCKED,
  SHELL_SCENARIO_JOIN_BLOQUEADO_S_N_O_AUTORIZA_USU_RIO,
  SHELL_SCENARIO_JOIN_FAILURE,
  SHELL_SCENARIO_JOIN_FALHO_INTEIRO_PRESERVA_P_C_E_ADOTA_T_EM_ESTADO_TERMINAL,
  SHELL_SCENARIO_JOIN_NEVER,
  SHELL_SCENARIO_JOIN_NEVER_STOP,
  SHELL_SCENARIO_OBSERVE,
  SHELL_SCENARIO_REL_GIO_FALHA_FECHADO_EM_S_PELO_KEEPER_INTEIRO,
  SHELL_SCENARIO_RESERVATION_DEATH,
  SHELL_SCENARIO_SESSION_DEATH,
  SHELL_SCENARIO_STATUS_EAGAIN_N_O_BLOQUEIA_STOP_E_REAP_NO_KEEPER_INTEIRO,
  SHELL_SCENARIO_STATUS_PRESSURE,
} from "./constants"
import { NativePhaseScenario } from "./native-phase-scenario"
import { assertSingleCommit } from "./phase-marker"
import { ShellWireTestSink } from "./shell-wire-support"

async function joinFailurePCT(): Promise<void> {
  const scenario = await NativePhaseScenario.create()
  try {
    const keeper = await scenario.start(SHELL_SCENARIO_JOIN_FAILURE)
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

test.skipIf(process.platform !== "darwin")(
  SHELL_SCENARIO_JOIN_FALHO_INTEIRO_PRESERVA_P_C_E_ADOTA_T_EM_ESTADO_TERMINAL,
  joinFailurePCT,
  SHELL_NATIVE_TEST_MS,
)

async function failedJoin(): Promise<void> {
  const scenario = await NativePhaseScenario.create()
  try {
    const keeper = await scenario.start(SHELL_SCENARIO_JOIN_FAILURE)
    await scenario.marker(SHELL_SCENARIO_JOIN_FAILURE)
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
    const keeper = await scenario.start(SHELL_SCENARIO_JOIN_BLOCKED)
    const identity = (await scenario.marker(SHELL_SCENARIO_JOIN_BLOCKED)).trim().split(SHELL_SCENARIO_)
    const reservation = Number(identity[1])
    const began = Date.now()
    if (mode === SHELL_SCENARIO_RESERVATION_DEATH) {
      process.kill(reservation, "SIGKILL")
      expect(await keeper.terminal).toBe(94)
    } else if (mode === SHELL_SCENARIO_SESSION_DEATH) {
      const closed = keeper.terminal
      if (!keeper.process.pid) {
        throw new Error(mode)
      }
      process.kill(keeper.process.pid, "SIGKILL")
      await expect(closed).rejects.toThrow()
    } else {
      if (mode === SHELL_SCENARIO_JOIN_NEVER_STOP) {
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
  .skipIf(process.platform !== "darwin")
  .each([
    SHELL_SCENARIO_RESERVATION_DEATH,
    SHELL_SCENARIO_SESSION_DEATH,
    SHELL_SCENARIO_JOIN_NEVER,
    SHELL_SCENARIO_JOIN_NEVER_STOP,
  ])(SHELL_SCENARIO_JOIN_BLOQUEADO_S_N_O_AUTORIZA_USU_RIO, blockedJoin, SHELL_NATIVE_TEST_MS)

async function lostAckAfterEmpty(): Promise<void> {
  const scenario = await NativePhaseScenario.create()
  try {
    const keeper = await scenario.start(SHELL_SCENARIO_OBSERVE)
    await once(keeper.status, "data")
    keeper.status.destroy()
    keeper.control.write(Buffer.from([2]))
    await scenario.marker(SHELL_SCENARIO_ESRCH)
    expect(await keeper.terminal).toBe(94)
    assertSingleCommit(await scenario.marker(SHELL_SCENARIO_ESRCH))
    expect(keeper.output.readableLength).toBe(0)
  } finally {
    await scenario.close()
  }
}

test.skipIf(process.platform !== "darwin")(
  SHELL_SCENARIO_ACK_PERDIDO_DEPOIS_DO_ESRCH_N_O_VIRA_SUCESSO_DO_KEEPER,
  lostAckAfterEmpty,
  SHELL_NATIVE_TEST_MS,
)

async function statusPressure(): Promise<void> {
  const scenario = await NativePhaseScenario.create()
  try {
    const keeper = await scenario.start(SHELL_SCENARIO_STATUS_PRESSURE)
    await scenario.marker(SHELL_SCENARIO_STATUS_PRESSURE)
    const began = Date.now()
    const frame = Buffer.alloc(9)
    frame[0] = 2
    frame.writeBigUInt64BE(process.hrtime.bigint() + 5000000000n, 1)
    keeper.control.write(frame)
    expect(await keeper.terminal).toBe(0)
    expect(Date.now() - began).toBeLessThan(5000)
    expect(keeper.output.readableLength).toBe(0)
    expect(keeper.statusBytes).toEqual(Buffer.from([1, 5, 0, 0, 0]))
    assertSingleCommit(await scenario.marker(SHELL_SCENARIO_ESRCH))
  } finally {
    await scenario.close()
  }
}

test.skipIf(process.platform !== "darwin")(
  SHELL_SCENARIO_STATUS_EAGAIN_N_O_BLOQUEIA_STOP_E_REAP_NO_KEEPER_INTEIRO,
  statusPressure,
  SHELL_NATIVE_TEST_MS,
)

async function failedClock(mode: string): Promise<void> {
  const scenario = await NativePhaseScenario.create()
  try {
    const keeper = await scenario.start(mode)
    if (mode !== SHELL_SCENARIO_CLOCK_RUNNING) {
      await once(keeper.status, "data")
      const frame = Buffer.alloc(9)
      frame[0] = 2
      frame.writeBigUInt64BE(process.hrtime.bigint() + 5000000000n, 1)
      keeper.control.write(frame)
    }
    await scenario.marker(SHELL_SCENARIO_CLOCK_FAILED)
    expect(await keeper.terminal).toBe(94)
    expect(keeper.statusBytes.includes(3)).toBe(false)
    expect(keeper.output.readableLength).toBe(0)
  } finally {
    await scenario.close()
  }
}

test
  .skipIf(process.platform !== "darwin")
  .each([SHELL_SCENARIO_CLOCK_RUNNING, SHELL_SCENARIO_CLOCK_STOP, SHELL_SCENARIO_CLOCK_ACK])(
  SHELL_SCENARIO_REL_GIO_FALHA_FECHADO_EM_S_PELO_KEEPER_INTEIRO,
  failedClock,
  SHELL_NATIVE_TEST_MS,
)

test.skipIf(process.platform !== "darwin")(SHELL_PHASE_JOIN_FAILED_TITLE, failedJoin, SHELL_NATIVE_TEST_MS)

function duplicateCommitRejected(): void {
  expect(assertSingleCommit.bind(undefined, SHELL_PHASE_MARKER_TWO_COMMITS)).toThrow()
}

test(SHELL_PHASE_MARKER_DUPLICATE_TITLE, duplicateCommitRejected)
