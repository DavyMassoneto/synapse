import { createHash, randomUUID } from "node:crypto"
import { lstat, mkdir, rename, rm, stat, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import { gunzipSync } from "node:zlib"
import {
  UNIX_LAUNCHER_ARCHIVE_EXTENSION,
  UNIX_LAUNCHER_ARM64,
  UNIX_LAUNCHER_ASSET_BYTES,
  UNIX_LAUNCHER_ASSETS,
  UNIX_LAUNCHER_CACHE,
  UNIX_LAUNCHER_CACHE_PARENT,
  UNIX_LAUNCHER_CONTENT_LENGTH,
  UNIX_LAUNCHER_DARWIN,
  UNIX_LAUNCHER_DECIMAL,
  UNIX_LAUNCHER_DOWNLOAD_MS,
  UNIX_LAUNCHER_EXECUTABLE_BYTES,
  UNIX_LAUNCHER_EXECUTABLE_MODE,
  UNIX_LAUNCHER_EXISTS,
  UNIX_LAUNCHER_HASH,
  UNIX_LAUNCHER_HEX,
  UNIX_LAUNCHER_INVALID,
  UNIX_LAUNCHER_LINUX,
  UNIX_LAUNCHER_MISSING,
  UNIX_LAUNCHER_NOT_EMPTY,
  UNIX_LAUNCHER_RELEASE_URL,
  UNIX_LAUNCHER_UNSAFE_MODE,
  UNIX_LAUNCHER_UNSUPPORTED,
  UNIX_LAUNCHER_VERSION,
  UNIX_LAUNCHER_WRITE_FLAG,
  UNIX_LAUNCHER_X64,
} from "./constants"
import { type UnixLauncherAsset } from "./types"
import { verifyUnixLauncher } from "./verification"

export async function provisionUnixLauncher(signal?: AbortSignal): Promise<string> {
  signal?.throwIfAborted()
  const asset = selectUnixLauncherAsset()
  const root = join(homedir(), UNIX_LAUNCHER_CACHE_PARENT, UNIX_LAUNCHER_CACHE, UNIX_LAUNCHER_VERSION, asset.sha256)
  const executable = join(root, asset.name)
  try {
    await stat(executable)
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === UNIX_LAUNCHER_MISSING)) {
      throw error
    }
    await installUnixLauncher(asset, root, UNIX_LAUNCHER_RELEASE_URL, signal)
  }
  await verifyUnixLauncher(executable, asset, signal)
  signal?.throwIfAborted()
  return executable
}
function selectUnixLauncherAsset(): UnixLauncherAsset {
  if (
    process.platform === UNIX_LAUNCHER_DARWIN &&
    (process.arch === UNIX_LAUNCHER_ARM64 || process.arch === UNIX_LAUNCHER_X64)
  ) {
    return UNIX_LAUNCHER_ASSETS.darwin
  }
  if (process.platform === UNIX_LAUNCHER_LINUX && process.arch === UNIX_LAUNCHER_X64) {
    return UNIX_LAUNCHER_ASSETS.linuxX64
  }
  if (process.platform === UNIX_LAUNCHER_LINUX && process.arch === UNIX_LAUNCHER_ARM64) {
    return UNIX_LAUNCHER_ASSETS.linuxArm64
  }
  throw new Error(UNIX_LAUNCHER_UNSUPPORTED)
}
export async function installUnixLauncher(
  asset: UnixLauncherAsset,
  root: string,
  baseUrl: string,
  signal?: AbortSignal,
): Promise<void> {
  const cancellation = AbortSignal.any([AbortSignal.timeout(UNIX_LAUNCHER_DOWNLOAD_MS), ...(signal ? [signal] : [])])
  const stage = await createUnixLauncherStage(root)
  try {
    const response = await fetch(`${baseUrl}${asset.name}${UNIX_LAUNCHER_ARCHIVE_EXTENSION}`, {
      signal: cancellation,
    })
    if (!response.ok || !response.body) {
      throw new Error(UNIX_LAUNCHER_INVALID)
    }
    const declared = response.headers.get(UNIX_LAUNCHER_CONTENT_LENGTH)
    if (declared && (!UNIX_LAUNCHER_DECIMAL.test(declared) || Number(declared) > UNIX_LAUNCHER_ASSET_BYTES)) {
      throw new Error(UNIX_LAUNCHER_INVALID)
    }
    const bytes = await readUnixLauncherDownload(response.body, cancellation)
    if (createHash(UNIX_LAUNCHER_HASH).update(bytes).digest(UNIX_LAUNCHER_HEX) !== asset.archiveSha256) {
      throw new Error(UNIX_LAUNCHER_INVALID)
    }
    const binary = gunzipSync(bytes, { maxOutputLength: UNIX_LAUNCHER_EXECUTABLE_BYTES })
    const executable = join(stage, asset.name)
    await writeFile(executable, binary, { mode: UNIX_LAUNCHER_EXECUTABLE_MODE, flag: UNIX_LAUNCHER_WRITE_FLAG })
    cancellation.throwIfAborted()
    await verifyUnixLauncher(executable, asset, cancellation)
    cancellation.throwIfAborted()
    await publishUnixLauncher(stage, root, asset, cancellation)
  } finally {
    await rm(stage, { recursive: true, force: true })
  }
}
async function createUnixLauncherStage(root: string): Promise<string> {
  const parent = dirname(root)
  await mkdir(parent, { recursive: true, mode: UNIX_LAUNCHER_EXECUTABLE_MODE })
  const status = await lstat(parent)
  if (!status.isDirectory() || status.isSymbolicLink() || (status.mode & UNIX_LAUNCHER_UNSAFE_MODE) !== 0) {
    throw new Error(UNIX_LAUNCHER_INVALID)
  }
  const stage = `${root}-${randomUUID()}`
  await mkdir(stage, { mode: UNIX_LAUNCHER_EXECUTABLE_MODE })
  return stage
}
async function publishUnixLauncher(
  stage: string,
  root: string,
  asset: UnixLauncherAsset,
  signal: AbortSignal,
): Promise<void> {
  signal.throwIfAborted()
  try {
    await rename(stage, root)
  } catch (error) {
    if (
      !(
        error instanceof Error &&
        "code" in error &&
        (error.code === UNIX_LAUNCHER_EXISTS || error.code === UNIX_LAUNCHER_NOT_EMPTY)
      )
    ) {
      throw error
    }
    await verifyUnixLauncher(join(root, asset.name), asset, signal)
  }
}
async function readUnixLauncherDownload(stream: ReadableStream<Uint8Array>, signal: AbortSignal): Promise<Buffer> {
  const chunks: Buffer[] = []
  const reader = stream.getReader()
  let length = 0
  try {
    let result = await reader.read()
    while (!result.done) {
      signal.throwIfAborted()
      length += result.value.byteLength
      if (length > UNIX_LAUNCHER_ASSET_BYTES) {
        throw new Error(UNIX_LAUNCHER_INVALID)
      }
      chunks.push(Buffer.from(result.value))
      result = await reader.read()
    }
  } finally {
    await reader.cancel()
  }
  return Buffer.concat(chunks)
}
