import { execFile } from "node:child_process"
import { mkdtemp, rm, symlink } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { promisify } from "node:util"
import { expect, test } from "vitest"
import {
  quoteWatchdogShellArgument,
  WATCHDOG_DIRECTORY,
  WATCHDOG_NODE_EVAL_FLAG,
  WATCHDOG_SHELL_ARGUMENT_SEPARATOR,
  WATCHDOG_SHELL_COMMAND_FLAG,
  WATCHDOG_SHELL_EXECUTABLE,
  WATCHDOG_SHELL_ROUNDTRIP_SCRIPT,
  WATCHDOG_SHELL_ROUNDTRIP_TITLE,
  WATCHDOG_SHELL_SPECIAL_ARGUMENT,
  WATCHDOG_SHELL_SPECIAL_FILENAME,
  WATCHDOG_TEST_TIMEOUT_MS,
} from "../fixtures"

async function shellArgumentsRoundtrip(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), WATCHDOG_DIRECTORY))
  try {
    const executable = join(directory, WATCHDOG_SHELL_SPECIAL_FILENAME)
    await symlink(process.execPath, executable)
    const command = [
      quoteWatchdogShellArgument(executable),
      WATCHDOG_NODE_EVAL_FLAG,
      quoteWatchdogShellArgument(WATCHDOG_SHELL_ROUNDTRIP_SCRIPT),
      quoteWatchdogShellArgument(WATCHDOG_SHELL_SPECIAL_ARGUMENT),
    ].join(WATCHDOG_SHELL_ARGUMENT_SEPARATOR)
    const result = await promisify(execFile)(WATCHDOG_SHELL_EXECUTABLE, [WATCHDOG_SHELL_COMMAND_FLAG, command])
    expect(result.stdout).toBe(WATCHDOG_SHELL_SPECIAL_ARGUMENT)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

test(WATCHDOG_SHELL_ROUNDTRIP_TITLE, shellArgumentsRoundtrip, WATCHDOG_TEST_TIMEOUT_MS)
