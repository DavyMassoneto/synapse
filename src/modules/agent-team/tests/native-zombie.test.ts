import { execFileSync } from "node:child_process"
import { once } from "node:events"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { SHELL_NATIVE_TEST_MS, SHELL_NATIVE_ZOMBIE_TITLE } from "./constants"
import { NativeTransport } from "./native-transport"

async function zombieIsNotEmpty(): Promise<void> {
  const directory = mkdtempSync(join(tmpdir(), "native-zombie-"))
  const executable = join(directory, "fixture")
  execFileSync("cc", ["-O2", join(__dirname, "native-zombie-fixture.c"), "-o", executable])
  const transport = await NativeTransport.create(`exec '${executable}'`)
  await transport.reservationPid()
  await once(transport.status, "data")
  const output = once(transport.output, "data")
  transport.release()
  await output
  const started = performance.now()
  transport.stop(process.hrtime.bigint() + 5000000000n)
  expect(await transport.closed()).not.toBe(0)
  expect(performance.now() - started).toBeGreaterThan(4500)
  expect(transport.output.destroyed).toBe(true)
  rmSync(directory, { recursive: true, force: true })
}

test.skipIf(process.platform !== "darwin")(SHELL_NATIVE_ZOMBIE_TITLE, zombieIsNotEmpty, SHELL_NATIVE_TEST_MS)
