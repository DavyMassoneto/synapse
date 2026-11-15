import { createHash } from "node:crypto"
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { gzipSync } from "node:zlib"
import { expect, test } from "vitest"
import {
  installUnixLauncher,
  provisionUnixLauncher,
  UNIX_LAUNCHER_ASSETS,
  verifyUnixLauncher,
} from "#synapse/modules/agent-team/adapters/supervised-shell/unix/provision"
import {
  SHELL_NATIVE_BAD_CACHE_TITLE,
  SHELL_NATIVE_DOWNLOAD_ABORT_TITLE,
  SHELL_NATIVE_DOWNLOAD_BAD_HASH_TITLE,
  SHELL_NATIVE_DOWNLOAD_CONCURRENT_TITLE,
  SHELL_NATIVE_SYMLINK_TITLE,
} from "./constants"
import { NativeArtifactServer } from "./native-artifact-server"
import {
  SHELL_PROVISION_BAD_ARCHIVE,
  SHELL_PROVISION_BAD_BINARY,
  SHELL_PROVISION_CACHE_PREFIX,
  SHELL_PROVISION_CANCEL_PREFIX,
  SHELL_PROVISION_CANCELLED,
  SHELL_PROVISION_DOWNLOAD_PREFIX,
  SHELL_PROVISION_FILE,
  SHELL_PROVISION_LINK_PREFIX,
  SHELL_PROVISION_PUBLISHED,
  SHELL_PROVISION_SUCCESS_PREFIX,
  SHELL_PROVISION_TARGET,
  SHELL_PROVISION_UNUSED_ARCHIVE,
  SHELL_TEST_HEX_ENCODING,
  SHELL_TEST_NO_ARCHIVE_HASH,
  SHELL_TEST_SHA256,
  SHELL_TEST_WINDOWS_PLATFORM,
} from "./native-scenario-constants"

async function rejectsCorruptCache(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), SHELL_PROVISION_CACHE_PREFIX))
  const file = join(directory, SHELL_PROVISION_FILE)
  try {
    await writeFile(file, SHELL_PROVISION_BAD_BINARY)
    await expect(verifyUnixLauncher(file, UNIX_LAUNCHER_ASSETS.darwin)).rejects.toThrow()
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}
async function rejectsSymlinkCache(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), SHELL_PROVISION_LINK_PREFIX))
  const file = join(directory, SHELL_PROVISION_FILE)
  const target = join(directory, SHELL_PROVISION_TARGET)
  try {
    await writeFile(target, SHELL_PROVISION_BAD_BINARY)
    await symlink(target, file)
    await expect(
      verifyUnixLauncher(file, {
        name: SHELL_PROVISION_FILE,
        sha256: createHash(SHELL_TEST_SHA256).update(SHELL_PROVISION_BAD_BINARY).digest(SHELL_TEST_HEX_ENCODING),
        archiveSha256: SHELL_TEST_NO_ARCHIVE_HASH,
      }),
    ).rejects.toThrow()
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

async function rejectsDownloadHash(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), SHELL_PROVISION_DOWNLOAD_PREFIX))
  try {
    const server = new NativeArtifactServer(Buffer.from(SHELL_PROVISION_BAD_ARCHIVE))
    const url = await server.start()
    try {
      await expect(
        installUnixLauncher(UNIX_LAUNCHER_ASSETS.darwin, join(directory, SHELL_PROVISION_PUBLISHED), url),
      ).rejects.toThrow()
    } finally {
      await server.close()
    }
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

async function installsVerifiedConcurrentDownloads(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), SHELL_PROVISION_SUCCESS_PREFIX))
  try {
    const executable = await provisionUnixLauncher()
    const binary = await readFile(executable)
    const archive = gzipSync(binary)
    const asset = {
      name: SHELL_PROVISION_FILE,
      sha256: createHash(SHELL_TEST_SHA256).update(binary).digest(SHELL_TEST_HEX_ENCODING),
      archiveSha256: createHash(SHELL_TEST_SHA256).update(archive).digest(SHELL_TEST_HEX_ENCODING),
    }
    const server = new NativeArtifactServer(archive)
    const url = await server.start()
    const destination = join(directory, SHELL_PROVISION_PUBLISHED)
    try {
      await Promise.all([installUnixLauncher(asset, destination, url), installUnixLauncher(asset, destination, url)])
      await expect(verifyUnixLauncher(join(destination, asset.name), asset)).resolves.toBeUndefined()
    } finally {
      await server.close()
    }
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

async function cancelledProvisionDoesNotPublish(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), SHELL_PROVISION_CANCEL_PREFIX))
  try {
    const server = new NativeArtifactServer(Buffer.from(SHELL_PROVISION_UNUSED_ARCHIVE))
    const url = await server.start()
    const cancellation = new AbortController()
    cancellation.abort(new Error(SHELL_PROVISION_CANCELLED))
    try {
      await expect(
        installUnixLauncher(
          UNIX_LAUNCHER_ASSETS.darwin,
          join(directory, SHELL_PROVISION_PUBLISHED),
          url,
          cancellation.signal,
        ),
      ).rejects.toThrow(SHELL_PROVISION_CANCELLED)
    } finally {
      await server.close()
    }
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

test(SHELL_NATIVE_DOWNLOAD_ABORT_TITLE, cancelledProvisionDoesNotPublish)
test.skipIf(process.platform === SHELL_TEST_WINDOWS_PLATFORM)(
  SHELL_NATIVE_DOWNLOAD_CONCURRENT_TITLE,
  installsVerifiedConcurrentDownloads,
)
test(SHELL_NATIVE_DOWNLOAD_BAD_HASH_TITLE, rejectsDownloadHash)
test(SHELL_NATIVE_BAD_CACHE_TITLE, rejectsCorruptCache)
test(SHELL_NATIVE_SYMLINK_TITLE, rejectsSymlinkCache)
