import { execFileSync } from "node:child_process"
import { once } from "node:events"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { SHELL_NATIVE_TEST_MS, SHELL_NATIVE_ZOMBIE_TITLE } from "./constants"
import {
  SHELL_COMPILED_NATIVE_CC,
  SHELL_COMPILED_NATIVE_OUTPUT,
  SHELL_TEST_EVENT_DATA,
} from "./native-fixture-constants"
import {
  SHELL_TEST_WINDOWS_PLATFORM,
  SHELL_ZOMBIE_DIRECTORY_PREFIX,
  SHELL_ZOMBIE_EXEC_PREFIX,
  SHELL_ZOMBIE_EXEC_SUFFIX,
  SHELL_ZOMBIE_EXECUTABLE,
  SHELL_ZOMBIE_OPTIMIZE,
  SHELL_ZOMBIE_SOURCE,
} from "./native-scenario-constants"
import { NativeTransport } from "./native-transport"

async function zombieIsNotEmpty(): Promise<void> {
  const directory = mkdtempSync(join(tmpdir(), SHELL_ZOMBIE_DIRECTORY_PREFIX))
  try {
    const executable = join(directory, SHELL_ZOMBIE_EXECUTABLE)
    execFileSync(SHELL_COMPILED_NATIVE_CC, [
      SHELL_ZOMBIE_OPTIMIZE,
      join(__dirname, SHELL_ZOMBIE_SOURCE),
      SHELL_COMPILED_NATIVE_OUTPUT,
      executable,
    ])
    const transport = await NativeTransport.create(
      `${SHELL_ZOMBIE_EXEC_PREFIX}${executable}${SHELL_ZOMBIE_EXEC_SUFFIX}`,
    )
    try {
      await transport.reservationPid()
      await once(transport.status, SHELL_TEST_EVENT_DATA)
      const output = once(transport.output, SHELL_TEST_EVENT_DATA)
      transport.release()
      await output
      const started = performance.now()
      transport.stop(process.hrtime.bigint() + 5000000000n)
      expect(await transport.closed()).not.toBe(0)
      expect(performance.now() - started).toBeGreaterThan(4500)
      expect(transport.output.destroyed).toBe(true)
    } finally {
      await transport.close()
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_ZOMBIE_TITLE,
  zombieIsNotEmpty,
  SHELL_NATIVE_TEST_MS,
)
