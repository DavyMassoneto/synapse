import { randomUUID } from "node:crypto"
import { lstat, mkdir, rename, rm, stat, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import { gunzipSync } from "node:zlib"
import {
  UNIX_LAUNCHER_ARM64,
  UNIX_LAUNCHER_CACHE,
  UNIX_LAUNCHER_CACHE_PARENT,
  UNIX_LAUNCHER_DARWIN,
  UNIX_LAUNCHER_DOWNLOAD_MS,
  UNIX_LAUNCHER_EXECUTABLE_BYTES,
  UNIX_LAUNCHER_EXECUTABLE_MODE,
  UNIX_LAUNCHER_EXISTS,
  UNIX_LAUNCHER_LINUX,
  UNIX_LAUNCHER_MISSING,
  UNIX_LAUNCHER_NOT_EMPTY,
  UNIX_LAUNCHER_PLATFORM_ASSETS,
  UNIX_LAUNCHER_RELEASE_URL,
  UNIX_LAUNCHER_UNSUPPORTED,
  UNIX_LAUNCHER_VERSION,
  UNIX_LAUNCHER_WRITE_FLAG,
  UNIX_LAUNCHER_X64,
} from "./constants"
import { requirePrivateLauncherDirectory } from "./directory-security"
import { downloadUnixLauncher } from "./download"
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
  const platform = process.platform
  const architecture = process.arch
  if (
    (platform === UNIX_LAUNCHER_DARWIN || platform === UNIX_LAUNCHER_LINUX) &&
    (architecture === UNIX_LAUNCHER_ARM64 || architecture === UNIX_LAUNCHER_X64)
  ) {
    return UNIX_LAUNCHER_PLATFORM_ASSETS[platform][architecture]
  }
  throw new Error(UNIX_LAUNCHER_UNSUPPORTED)
}
export async function installUnixLauncher(
  asset: UnixLauncherAsset,
  root: string,
  baseUrl: string,
  signal?: AbortSignal,
): Promise<void> {
  signal?.throwIfAborted()
  const cancellation = AbortSignal.any([AbortSignal.timeout(UNIX_LAUNCHER_DOWNLOAD_MS), ...(signal ? [signal] : [])])
  const stage = await createUnixLauncherStage(root)
  try {
    const bytes = await downloadUnixLauncher(asset, baseUrl, cancellation)
    const executable = await stageUnixLauncher(bytes, stage, asset)
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
  requirePrivateLauncherDirectory(status)
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

async function stageUnixLauncher(bytes: Buffer, stage: string, asset: UnixLauncherAsset): Promise<string> {
  const binary = gunzipSync(bytes, { maxOutputLength: UNIX_LAUNCHER_EXECUTABLE_BYTES })
  const executable = join(stage, asset.name)
  await writeFile(executable, binary, { mode: UNIX_LAUNCHER_EXECUTABLE_MODE, flag: UNIX_LAUNCHER_WRITE_FLAG })
  return executable
}
