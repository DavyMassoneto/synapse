import { once } from "node:events"
import { expect, test } from "vitest"
import { SHELL_GENERATION_COMMAND, SHELL_GENERATION_ISOLATION_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { KeeperRuntimeScenario } from "./keeper-runtime-scenario"
import { SHELL_TEST_EVENT_DATA } from "./native-fixture-constants"
import {
  SHELL_TEST_CURRENT_GENERATION_COMMAND,
  SHELL_TEST_ISOLATED_OUTPUT,
  SHELL_TEST_WINDOWS_PLATFORM,
} from "./native-scenario-constants"

async function exclusiveGenerations(): Promise<void> {
  const current = await KeeperRuntimeScenario.create(SHELL_TEST_CURRENT_GENERATION_COMMAND)
  try {
    const other = await KeeperRuntimeScenario.create(SHELL_GENERATION_COMMAND)
    try {
      await Promise.all([once(current.status, SHELL_TEST_EVENT_DATA), once(other.status, SHELL_TEST_EVENT_DATA)])
      const output = once(other.output, SHELL_TEST_EVENT_DATA)
      other.control.write(Buffer.from([1]))
      const attempted = await output
      expect(attempted[0]).toEqual(Buffer.from(SHELL_TEST_ISOLATED_OUTPUT))
      other.control.end()
      expect(await other.terminal).toBe(0)
      expect(current.statusBytes).toEqual(Buffer.from([1]))
      expect(current.output.readableLength).toBe(0)
      current.control.end()
      expect(await current.terminal).toBe(0)
      expect(current.statusBytes).toEqual(Buffer.from([1, 5, 0, 0, 0]))
    } finally {
      await other.close()
    }
  } finally {
    await current.close()
  }
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_GENERATION_ISOLATION_TITLE,
  exclusiveGenerations,
  SHELL_NATIVE_TEST_MS,
)
