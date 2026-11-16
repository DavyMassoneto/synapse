import { execFile } from "node:child_process"
import { createHash } from "node:crypto"
import { chmod, lstat, readFile } from "node:fs/promises"
import { dirname } from "node:path"
import { Value } from "typebox/value"
import {
  UNIX_LAUNCHER_ARCHITECTURE_FIELD,
  UNIX_LAUNCHER_CLOCK_FIELD,
  UNIX_LAUNCHER_EXECUTABLE_BYTES,
  UNIX_LAUNCHER_EXECUTABLE_MODE,
  UNIX_LAUNCHER_HASH,
  UNIX_LAUNCHER_HEX,
  UNIX_LAUNCHER_IDENTITY_ARGUMENT,
  UNIX_LAUNCHER_IDENTITY_SEPARATOR,
  UNIX_LAUNCHER_INVALID,
  UNIX_LAUNCHER_PLATFORM_FIELD,
  UNIX_LAUNCHER_PROBE_MS,
  UNIX_LAUNCHER_UTF8,
} from "./constants"
import { requirePrivateLauncherDirectory } from "./directory-security"
import { UNIX_LAUNCHER_IDENTITY_SCHEMA } from "./schemas"
import {
  type UnixLauncherAsset,
  type UnixLauncherProbeError,
  type UnixLauncherProbeOptions,
  type UnixLauncherProbeReject,
  type UnixLauncherProbeResolve,
} from "./types"

export async function verifyUnixLauncher(
  executable: string,
  asset: UnixLauncherAsset,
  signal?: AbortSignal,
): Promise<void> {
  await verifyUnixLauncherFile(executable, asset)
  await verifyUnixLauncherIdentity(executable, signal)
}
async function verifyUnixLauncherFile(executable: string, asset: UnixLauncherAsset): Promise<void> {
  const directory = await lstat(dirname(executable))
  requirePrivateLauncherDirectory(directory)
  const status = await lstat(executable)
  if (!status.isFile() || status.size > UNIX_LAUNCHER_EXECUTABLE_BYTES) {
    throw new Error(UNIX_LAUNCHER_INVALID)
  }
  const content = await readFile(executable)
  if (createHash(UNIX_LAUNCHER_HASH).update(content).digest(UNIX_LAUNCHER_HEX) !== asset.sha256) {
    throw new Error(UNIX_LAUNCHER_INVALID)
  }
  await chmod(executable, UNIX_LAUNCHER_EXECUTABLE_MODE)
}
async function verifyUnixLauncherIdentity(executable: string, signal?: AbortSignal): Promise<void> {
  const before = process.hrtime.bigint()
  const output = await new Promise<string>(probeUnixLauncher.bind(undefined, executable, signal ? { signal } : {}))
  const after = process.hrtime.bigint()
  const fields = Value.Parse(UNIX_LAUNCHER_IDENTITY_SCHEMA, output.trim().split(UNIX_LAUNCHER_IDENTITY_SEPARATOR))
  if (
    fields[UNIX_LAUNCHER_PLATFORM_FIELD] !== process.platform ||
    fields[UNIX_LAUNCHER_ARCHITECTURE_FIELD] !== process.arch
  ) {
    throw new Error(UNIX_LAUNCHER_INVALID)
  }
  const clock = BigInt(fields[UNIX_LAUNCHER_CLOCK_FIELD])
  if (clock < before || clock > after) {
    throw new Error(UNIX_LAUNCHER_INVALID)
  }
}
function probeUnixLauncher(
  executable: string,
  options: UnixLauncherProbeOptions,
  resolve: UnixLauncherProbeResolve,
  reject: UnixLauncherProbeReject,
): void {
  execFile(
    executable,
    [UNIX_LAUNCHER_IDENTITY_ARGUMENT],
    { encoding: UNIX_LAUNCHER_UTF8, timeout: UNIX_LAUNCHER_PROBE_MS, ...options },
    probedUnixLauncher.bind(undefined, resolve, reject),
  )
}
function probedUnixLauncher(
  resolve: UnixLauncherProbeResolve,
  reject: UnixLauncherProbeReject,
  error: UnixLauncherProbeError,
  stdout: string,
  stderr: string,
): void {
  if (error || stderr) {
    reject(new Error(UNIX_LAUNCHER_INVALID))
  } else {
    resolve(stdout)
  }
}
