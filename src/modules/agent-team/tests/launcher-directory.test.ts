import { chmod, lstat, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { requirePrivateLauncherDirectory } from "#synapse/modules/agent-team/adapters/supervised-shell/unix/provision"
import {
  SHELL_DIRECTORY_MODE_TITLE,
  SHELL_DIRECTORY_MODES,
  SHELL_DIRECTORY_NON_DIRECTORY_KINDS,
  SHELL_DIRECTORY_NON_DIRECTORY_TITLE,
} from "./constants"
import {
  SHELL_DIRECTORY_FILE,
  SHELL_DIRECTORY_FILE_CONTENT,
  SHELL_DIRECTORY_KIND_PREFIX,
  SHELL_DIRECTORY_LINK,
  SHELL_DIRECTORY_MODE_PREFIX,
  SHELL_DIRECTORY_TARGET,
  SHELL_TEST_WINDOWS_PLATFORM,
} from "./native-scenario-constants"

async function directoryMode(mode: number): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), SHELL_DIRECTORY_MODE_PREFIX))
  try {
    await chmod(directory, mode)
    const status = await lstat(directory)
    if (mode === 0o700 || mode === 0o750) {
      expect(requirePrivateLauncherDirectory.bind(undefined, status)).not.toThrow()
    } else {
      expect(requirePrivateLauncherDirectory.bind(undefined, status)).toThrow()
    }
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

async function rejectsNonDirectory(kind: string): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), SHELL_DIRECTORY_KIND_PREFIX))
  try {
    const target = join(root, SHELL_DIRECTORY_TARGET)
    await mkdir(target)
    const link = join(root, SHELL_DIRECTORY_LINK)
    await symlink(target, link)
    const file = join(root, SHELL_DIRECTORY_FILE)
    await writeFile(file, SHELL_DIRECTORY_FILE_CONTENT)
    const path = kind === SHELL_DIRECTORY_LINK ? link : file
    expect(requirePrivateLauncherDirectory.bind(undefined, await lstat(path))).toThrow()
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM).each(SHELL_DIRECTORY_MODES)(
  SHELL_DIRECTORY_MODE_TITLE,
  directoryMode,
)
test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM).each(SHELL_DIRECTORY_NON_DIRECTORY_KINDS)(
  SHELL_DIRECTORY_NON_DIRECTORY_TITLE,
  rejectsNonDirectory,
)
