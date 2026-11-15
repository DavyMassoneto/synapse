import { once } from "node:events"
import { setTimeout } from "node:timers/promises"
import { expect, test } from "vitest"
import {
  SHELL_NATIVE_TEST_MS,
  SHELL_RUNTIME_DUPLICATE_TITLE,
  SHELL_RUNTIME_INVALID_TITLE,
  SHELL_RUNTIME_PARTIAL_TITLE,
  SHELL_SCENARIO_INCOMPLETE_DEADLINE,
  SHELL_SCENARIO_PRINTF_FORBIDDEN,
  SHELL_SCENARIO_STOP_V_LIDO_FRAGMENTADO_NA_FRONTEIRA_S_PRESERVA_CANCELAMENTO,
} from "./constants"
import { KeeperRuntimeScenario } from "./keeper-runtime-scenario"

async function invalidControl(): Promise<void> {
  const scenario = await KeeperRuntimeScenario.create(SHELL_SCENARIO_PRINTF_FORBIDDEN)
  await once(scenario.status, "data")
  scenario.control.write(Buffer.from([99]))
  expect(await scenario.terminal).toBe(0)
  expect(scenario.statusBytes.subarray(0, 3)).toEqual(Buffer.from([1, 5, 1]))
  expect(scenario.output.readableLength).toBe(0)
}

async function partialStop(): Promise<void> {
  const scenario = await KeeperRuntimeScenario.create(SHELL_SCENARIO_PRINTF_FORBIDDEN)
  await once(scenario.status, "data")
  const began = Date.now()
  scenario.control.end(Buffer.from([2]))
  expect(await scenario.terminal).toBe(0)
  expect(Date.now() - began).toBeLessThan(6000)
  expect(scenario.statusBytes.subarray(0, 3)).toEqual(Buffer.from([1, 5, 1]))
  expect(scenario.output.readableLength).toBe(0)
}

async function incompleteWithoutEof(): Promise<void> {
  const scenario = await KeeperRuntimeScenario.create(SHELL_SCENARIO_PRINTF_FORBIDDEN)
  await once(scenario.status, "data")
  const began = Date.now()
  scenario.control.write(Buffer.from([2]))
  expect(await scenario.terminal).toBe(94)
  expect(Date.now() - began).toBeGreaterThanOrEqual(4900)
  expect(Date.now() - began).toBeLessThan(6000)
  expect(scenario.statusBytes).toEqual(Buffer.from([1]))
  expect(scenario.output.readableLength).toBe(0)
}

test.skipIf(process.platform === "win32")(
  SHELL_SCENARIO_INCOMPLETE_DEADLINE,
  incompleteWithoutEof,
  SHELL_NATIVE_TEST_MS,
)

async function duplicateRelease(): Promise<void> {
  const scenario = await KeeperRuntimeScenario.create(SHELL_SCENARIO_PRINTF_FORBIDDEN)
  await once(scenario.status, "data")
  scenario.control.write(Buffer.from([1, 1]))
  expect(await scenario.terminal).toBe(0)
  expect(scenario.output.readableLength).toBe(0)
  expect(scenario.statusBytes.subarray(0, 3)).toEqual(Buffer.from([1, 5, 1]))
}

async function fragmentedStop(boundary: number): Promise<void> {
  const scenario = await KeeperRuntimeScenario.create(SHELL_SCENARIO_PRINTF_FORBIDDEN)
  await once(scenario.status, "data")
  const frame = Buffer.alloc(9)
  frame[0] = 2
  frame.writeBigUInt64BE(process.hrtime.bigint() + 5000000000n, 1)
  scenario.control.write(frame.subarray(0, boundary))
  await setTimeout(100)
  scenario.control.write(frame.subarray(boundary))
  expect(await scenario.terminal).toBe(0)
  expect(scenario.statusBytes).toEqual(Buffer.from([1, 5, 0, 0, 0]))
  expect(scenario.output.readableLength).toBe(0)
}

test.skipIf(process.platform === "win32").each([1, 2, 3, 4, 5, 6, 7, 8, 9])(
  SHELL_SCENARIO_STOP_V_LIDO_FRAGMENTADO_NA_FRONTEIRA_S_PRESERVA_CANCELAMENTO,
  fragmentedStop,
  SHELL_NATIVE_TEST_MS,
)

test.skipIf(process.platform === "win32")(SHELL_RUNTIME_INVALID_TITLE, invalidControl, SHELL_NATIVE_TEST_MS)
test.skipIf(process.platform === "win32")(SHELL_RUNTIME_PARTIAL_TITLE, partialStop, SHELL_NATIVE_TEST_MS)
test.skipIf(process.platform === "win32")(SHELL_RUNTIME_DUPLICATE_TITLE, duplicateRelease, SHELL_NATIVE_TEST_MS)
