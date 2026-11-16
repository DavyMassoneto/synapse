import { once } from "node:events"
import { setTimeout } from "node:timers/promises"
import { expect, test } from "vitest"
import {
  SHELL_NATIVE_TEST_MS,
  SHELL_PHASE_FRAGMENTED_STOP_TITLE,
  SHELL_PHASE_INCOMPLETE_DEADLINE_TITLE,
  SHELL_PHASE_USER_COMMAND,
  SHELL_RUNTIME_DUPLICATE_TITLE,
  SHELL_RUNTIME_INVALID_TITLE,
  SHELL_RUNTIME_PARTIAL_TITLE,
} from "./constants"
import { KeeperRuntimeScenario } from "./keeper-runtime-scenario"
import { SHELL_TEST_EVENT_DATA } from "./native-fixture-constants"
import { SHELL_TEST_FRAGMENT_DELAY_MS, SHELL_TEST_WINDOWS_PLATFORM } from "./native-scenario-constants"

async function invalidControl(): Promise<void> {
  const scenario = await KeeperRuntimeScenario.create(SHELL_PHASE_USER_COMMAND)
  try {
    await once(scenario.status, SHELL_TEST_EVENT_DATA)
    scenario.control.write(Buffer.from([99]))
    expect(await scenario.terminal).toBe(0)
    expect(scenario.statusBytes.subarray(0, 3)).toEqual(Buffer.from([1, 5, 1]))
    expect(scenario.output.readableLength).toBe(0)
  } finally {
    await scenario.close()
  }
}

async function partialStop(): Promise<void> {
  const scenario = await KeeperRuntimeScenario.create(SHELL_PHASE_USER_COMMAND)
  try {
    await once(scenario.status, SHELL_TEST_EVENT_DATA)
    const began = Date.now()
    scenario.control.end(Buffer.from([2]))
    expect(await scenario.terminal).toBe(0)
    expect(Date.now() - began).toBeLessThan(6000)
    expect(scenario.statusBytes.subarray(0, 3)).toEqual(Buffer.from([1, 5, 1]))
    expect(scenario.output.readableLength).toBe(0)
  } finally {
    await scenario.close()
  }
}

async function incompleteWithoutEof(): Promise<void> {
  const scenario = await KeeperRuntimeScenario.create(SHELL_PHASE_USER_COMMAND)
  try {
    await once(scenario.status, SHELL_TEST_EVENT_DATA)
    const began = Date.now()
    scenario.control.write(Buffer.from([2]))
    expect(await scenario.terminal).toBe(94)
    expect(Date.now() - began).toBeGreaterThanOrEqual(4900)
    expect(Date.now() - began).toBeLessThan(6000)
    expect(scenario.statusBytes).toEqual(Buffer.from([1]))
    expect(scenario.output.readableLength).toBe(0)
  } finally {
    await scenario.close()
  }
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_PHASE_INCOMPLETE_DEADLINE_TITLE,
  incompleteWithoutEof,
  SHELL_NATIVE_TEST_MS,
)

async function duplicateRelease(): Promise<void> {
  const scenario = await KeeperRuntimeScenario.create(SHELL_PHASE_USER_COMMAND)
  try {
    await once(scenario.status, SHELL_TEST_EVENT_DATA)
    scenario.control.write(Buffer.from([1, 1]))
    expect(await scenario.terminal).toBe(0)
    expect(scenario.output.readableLength).toBe(0)
    expect(scenario.statusBytes.subarray(0, 3)).toEqual(Buffer.from([1, 5, 1]))
  } finally {
    await scenario.close()
  }
}

async function fragmentedStop(boundary: number): Promise<void> {
  const scenario = await KeeperRuntimeScenario.create(SHELL_PHASE_USER_COMMAND)
  try {
    await once(scenario.status, SHELL_TEST_EVENT_DATA)
    const frame = Buffer.alloc(9)
    frame[0] = 2
    frame.writeBigUInt64BE(process.hrtime.bigint() + 5000000000n, 1)
    scenario.control.write(frame.subarray(0, boundary))
    await setTimeout(SHELL_TEST_FRAGMENT_DELAY_MS)
    scenario.control.write(frame.subarray(boundary))
    expect(await scenario.terminal).toBe(0)
    expect(scenario.statusBytes).toEqual(Buffer.from([1, 5, 0, 0, 0]))
    expect(scenario.output.readableLength).toBe(0)
  } finally {
    await scenario.close()
  }
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM).each([1, 2, 3, 4, 5, 6, 7, 8, 9])(
  SHELL_PHASE_FRAGMENTED_STOP_TITLE,
  fragmentedStop,
  SHELL_NATIVE_TEST_MS,
)

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_RUNTIME_INVALID_TITLE,
  invalidControl,
  SHELL_NATIVE_TEST_MS,
)
test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_RUNTIME_PARTIAL_TITLE,
  partialStop,
  SHELL_NATIVE_TEST_MS,
)
test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_RUNTIME_DUPLICATE_TITLE,
  duplicateRelease,
  SHELL_NATIVE_TEST_MS,
)
