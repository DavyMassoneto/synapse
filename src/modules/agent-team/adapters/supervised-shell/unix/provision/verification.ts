import { execFile } from "node:child_process"
import { createHash } from "node:crypto"
import { chmod, lstat, readFile } from "node:fs/promises"
import { dirname } from "node:path"
import { Value } from "typebox/value"
import {
  UNIX_LAUNCHER_EXECUTABLE_BYTES,
  UNIX_LAUNCHER_EXECUTABLE_MODE,
  UNIX_LAUNCHER_HASH,
  UNIX_LAUNCHER_HEX,
  UNIX_LAUNCHER_IDENTITY_ARGUMENT,
  UNIX_LAUNCHER_IDENTITY_SEPARATOR,
  UNIX_LAUNCHER_INVALID,
  UNIX_LAUNCHER_PROBE_MS,
  UNIX_LAUNCHER_UNSAFE_MODE,
  UNIX_LAUNCHER_UTF8,
} from "./constants"
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
  const directory = await lstat(dirname(executable))
  if (!directory.isDirectory() || directory.isSymbolicLink() || (directory.mode & UNIX_LAUNCHER_UNSAFE_MODE) !== 0) {
    throw new Error(UNIX_LAUNCHER_INVALID)
  }
  const status = await lstat(executable)
  if (!status.isFile() || status.size > UNIX_LAUNCHER_EXECUTABLE_BYTES) {
    throw new Error(UNIX_LAUNCHER_INVALID)
  }
  const content = await readFile(executable)
  if (createHash(UNIX_LAUNCHER_HASH).update(content).digest(UNIX_LAUNCHER_HEX) !== asset.sha256) {
    throw new Error(UNIX_LAUNCHER_INVALID)
  }
  await chmod(executable, UNIX_LAUNCHER_EXECUTABLE_MODE)
  const before = process.hrtime.bigint()
  const output = await new Promise<string>(probeUnixLauncher.bind(undefined, executable, signal ? { signal } : {}))
  const after = process.hrtime.bigint()
  const fields = Value.Parse(UNIX_LAUNCHER_IDENTITY_SCHEMA, output.trim().split(UNIX_LAUNCHER_IDENTITY_SEPARATOR))
  if (fields[1] !== process.platform || fields[2] !== process.arch) {
    throw new Error(UNIX_LAUNCHER_INVALID)
  }
  const clock = BigInt(fields[3])
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
