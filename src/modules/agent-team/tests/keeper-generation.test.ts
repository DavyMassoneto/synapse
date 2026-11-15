import { once } from "node:events"
import { expect, test } from "vitest"
import { SHELL_GENERATION_COMMAND, SHELL_GENERATION_ISOLATION_TITLE, SHELL_NATIVE_TEST_MS } from "./constants"
import { KeeperRuntimeScenario } from "./keeper-runtime-scenario"

async function exclusiveGenerations(): Promise<void> {
  const current = await KeeperRuntimeScenario.create("printf CURRENT_EXECUTED")
  const other = await KeeperRuntimeScenario.create(SHELL_GENERATION_COMMAND)
  await Promise.all([once(current.status, "data"), once(other.status, "data")])
  const output = once(other.output, "data")
  other.control.write(Buffer.from([1]))
  const attempted = await output
  expect(attempted[0]).toEqual(Buffer.from("ISOLATED"))
  other.control.end()
  expect(await other.terminal).toBe(0)
  expect(current.statusBytes).toEqual(Buffer.from([1]))
  expect(current.output.readableLength).toBe(0)
  current.control.end()
  expect(await current.terminal).toBe(0)
  expect(current.statusBytes).toEqual(Buffer.from([1, 5, 0, 0, 0]))
}

test.skipIf(process.platform === "win32")(SHELL_GENERATION_ISOLATION_TITLE, exclusiveGenerations, SHELL_NATIVE_TEST_MS)
