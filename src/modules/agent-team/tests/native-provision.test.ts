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

async function rejectsCorruptCache(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "native-cache-"))
  const file = join(directory, "launcher")
  try {
    await writeFile(file, "not executable")
    await expect(verifyUnixLauncher(file, UNIX_LAUNCHER_ASSETS.darwin)).rejects.toThrow()
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}
async function rejectsSymlinkCache(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "native-link-"))
  const file = join(directory, "launcher")
  const target = join(directory, "target")
  try {
    await writeFile(target, "not executable")
    await symlink(target, file)
    await expect(
      verifyUnixLauncher(file, {
        name: "launcher",
        sha256: createHash("sha256").update("not executable").digest("hex"),
        archiveSha256: "",
      }),
    ).rejects.toThrow()
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

async function rejectsDownloadHash(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "native-download-"))
  const server = new NativeArtifactServer(Buffer.from("corrupt archive"))
  const url = await server.start()
  try {
    await expect(installUnixLauncher(UNIX_LAUNCHER_ASSETS.darwin, join(directory, "published"), url)).rejects.toThrow()
  } finally {
    await server.close()
    await rm(directory, { recursive: true, force: true })
  }
}

async function installsVerifiedConcurrentDownloads(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "native-download-ok-"))
  const executable = await provisionUnixLauncher()
  const binary = await readFile(executable)
  const archive = gzipSync(binary)
  const asset = {
    name: "launcher",
    sha256: createHash("sha256").update(binary).digest("hex"),
    archiveSha256: createHash("sha256").update(archive).digest("hex"),
  }
  const server = new NativeArtifactServer(archive)
  const url = await server.start()
  const destination = join(directory, "published")
  try {
    await Promise.all([installUnixLauncher(asset, destination, url), installUnixLauncher(asset, destination, url)])
    await expect(verifyUnixLauncher(join(destination, asset.name), asset)).resolves.toBeUndefined()
  } finally {
    await server.close()
    await rm(directory, { recursive: true, force: true })
  }
}

async function cancelledProvisionDoesNotPublish(): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "native-download-cancel-"))
  const server = new NativeArtifactServer(Buffer.from("not used"))
  const url = await server.start()
  const cancellation = new AbortController()
  cancellation.abort(new Error("cancelled provision"))
  try {
    await expect(
      installUnixLauncher(UNIX_LAUNCHER_ASSETS.darwin, join(directory, "published"), url, cancellation.signal),
    ).rejects.toThrow("cancelled provision")
  } finally {
    await server.close()
    await rm(directory, { recursive: true, force: true })
  }
}

test(SHELL_NATIVE_DOWNLOAD_ABORT_TITLE, cancelledProvisionDoesNotPublish)
test.skipIf(process.platform === "win32")(SHELL_NATIVE_DOWNLOAD_CONCURRENT_TITLE, installsVerifiedConcurrentDownloads)
test(SHELL_NATIVE_DOWNLOAD_BAD_HASH_TITLE, rejectsDownloadHash)
test(SHELL_NATIVE_BAD_CACHE_TITLE, rejectsCorruptCache)
test(SHELL_NATIVE_SYMLINK_TITLE, rejectsSymlinkCache)
