import { createHash } from "node:crypto"
import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, test } from "vitest"
import { verifyUnixLauncher } from "#synapse/modules/agent-team/adapters/supervised-shell/unix/provision"
import { SHELL_NATIVE_IDENTITY_NEGATIVE_TITLE } from "./constants"

async function rejectsIdentity(output: string): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "native-identity-"))
  const file = join(directory, "launcher")
  const content = `#!/bin/sh\nprintf '%s\\n' '${output}'\n`
  try {
    await writeFile(file, content)
    await expect(
      verifyUnixLauncher(file, {
        name: "launcher",
        sha256: createHash("sha256").update(content).digest("hex"),
        archiveSha256: "",
      }),
    ).rejects.toThrow()
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

async function rejectsWritableDirectory(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "native-permissions-"))
  const file = join(directory, "launcher")
  try {
    await writeFile(file, "not executed")
    await chmod(directory, 0o777)
    await expect(
      verifyUnixLauncher(file, {
        name: "launcher",
        sha256: createHash("sha256").update("not executed").digest("hex"),
        archiveSha256: "",
      }),
    ).rejects.toThrow()
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

test
  .skipIf(process.platform === "win32")
  .each([
    "synapse-unix-launcher-v0 darwin arm64 1",
    "synapse-unix-launcher-v1 wrong arm64 1",
    "synapse-unix-launcher-v1 darwin wrong 1",
    "synapse-unix-launcher-v1 darwin arm64 0",
  ])(SHELL_NATIVE_IDENTITY_NEGATIVE_TITLE, rejectsIdentity)
test(SHELL_NATIVE_IDENTITY_NEGATIVE_TITLE, rejectsWritableDirectory)
