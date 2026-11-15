import { chmod, lstat, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { requirePrivateLauncherDirectory } from "#synapse/modules/agent-team/adapters/supervised-shell/unix/provision"
import { SHELL_DIRECTORY_MODE_TITLE, SHELL_DIRECTORY_MODES, SHELL_DIRECTORY_NON_DIRECTORY_TITLE } from "./constants"

async function directoryMode(mode: number): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "launcher-directory-"))
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

async function rejectsNonDirectory(): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "launcher-directory-kind-"))
  try {
    const target = join(root, "target")
    await mkdir(target)
    const link = join(root, "link")
    await symlink(target, link)
    const file = join(root, "file")
    await writeFile(file, "not a directory")
    expect(requirePrivateLauncherDirectory.bind(undefined, await lstat(link))).toThrow()
    expect(requirePrivateLauncherDirectory.bind(undefined, await lstat(file))).toThrow()
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

test.skipIf(process.platform === "win32").each(SHELL_DIRECTORY_MODES)(SHELL_DIRECTORY_MODE_TITLE, directoryMode)
test.skipIf(process.platform === "win32")(SHELL_DIRECTORY_NON_DIRECTORY_TITLE, rejectsNonDirectory)
