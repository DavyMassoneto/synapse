import { createHash } from "node:crypto"
import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { verifyUnixLauncher } from "#synapse/modules/agent-team/adapters/supervised-shell/unix/provision"
import { SHELL_NATIVE_IDENTITY_NEGATIVE_TITLE } from "./constants"
import {
  SHELL_IDENTITY_FILE,
  SHELL_IDENTITY_INVALID_OUTPUTS,
  SHELL_IDENTITY_NOT_EXECUTED,
  SHELL_IDENTITY_PERMISSIONS_PREFIX,
  SHELL_IDENTITY_SCRIPT_PREFIX,
  SHELL_IDENTITY_SCRIPT_SUFFIX,
  SHELL_IDENTITY_TEMP_PREFIX,
  SHELL_TEST_HEX_ENCODING,
  SHELL_TEST_NO_ARCHIVE_HASH,
  SHELL_TEST_SHA256,
  SHELL_TEST_WINDOWS_PLATFORM,
} from "./native-scenario-constants"

async function rejectsIdentity(output: string): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), SHELL_IDENTITY_TEMP_PREFIX))
  const file = join(directory, SHELL_IDENTITY_FILE)
  const content = `${SHELL_IDENTITY_SCRIPT_PREFIX}${output}${SHELL_IDENTITY_SCRIPT_SUFFIX}`
  try {
    await writeFile(file, content)
    await expect(
      verifyUnixLauncher(file, {
        name: SHELL_IDENTITY_FILE,
        sha256: createHash(SHELL_TEST_SHA256).update(content).digest(SHELL_TEST_HEX_ENCODING),
        archiveSha256: SHELL_TEST_NO_ARCHIVE_HASH,
      }),
    ).rejects.toThrow()
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

async function rejectsWritableDirectory(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), SHELL_IDENTITY_PERMISSIONS_PREFIX))
  const file = join(directory, SHELL_IDENTITY_FILE)
  try {
    await writeFile(file, SHELL_IDENTITY_NOT_EXECUTED)
    await chmod(directory, 0o777)
    await expect(
      verifyUnixLauncher(file, {
        name: SHELL_IDENTITY_FILE,
        sha256: createHash(SHELL_TEST_SHA256).update(SHELL_IDENTITY_NOT_EXECUTED).digest(SHELL_TEST_HEX_ENCODING),
        archiveSha256: SHELL_TEST_NO_ARCHIVE_HASH,
      }),
    ).rejects.toThrow()
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM).each(SHELL_IDENTITY_INVALID_OUTPUTS)(
  SHELL_NATIVE_IDENTITY_NEGATIVE_TITLE,
  rejectsIdentity,
)
test(SHELL_NATIVE_IDENTITY_NEGATIVE_TITLE, rejectsWritableDirectory)
