import { execFile } from "node:child_process"
import { constants } from "node:fs"
import { access } from "node:fs/promises"
import {
  SHELL_REQUIREMENT_ADD_TYPE,
  SHELL_REQUIREMENT_ADD_TYPE_MARKER,
  SHELL_REQUIREMENT_POWERSHELL,
  SHELL_REQUIREMENT_PROBE,
  SHELL_REQUIREMENT_PROBE_FLAGS,
  SHELL_REQUIREMENT_PROBE_MS,
  SHELL_REQUIREMENT_PS,
  SHELL_WIRE_UTF8,
} from "./constants"
import {
  type ShellRequirementError,
  type ShellRequirementOptions,
  type ShellRequirementReject,
  type ShellRequirementResolve,
} from "./types"

export async function requireUnixShell(ps: string): Promise<void> {
  try {
    await access(ps, constants.X_OK)
  } catch {
    throw new Error(SHELL_REQUIREMENT_PS)
  }
}
export async function requireWindowsShell(executable: string, signal?: AbortSignal): Promise<void> {
  try {
    await new Promise<void>(probeWindowsShell.bind(undefined, executable, signal ? { signal } : {}))
  } catch (error) {
    if (signal?.aborted && signal.reason instanceof Error) {
      throw signal.reason
    }
    throw error
  }
}
function probeWindowsShell(
  executable: string,
  options: ShellRequirementOptions,
  resolve: ShellRequirementResolve,
  reject: ShellRequirementReject,
): void {
  execFile(
    executable,
    [...SHELL_REQUIREMENT_PROBE_FLAGS, SHELL_REQUIREMENT_PROBE],
    {
      timeout: SHELL_REQUIREMENT_PROBE_MS,
      encoding: SHELL_WIRE_UTF8,
      ...(options.signal ? { signal: options.signal } : {}),
    },
    checkedWindowsShell.bind(undefined, resolve, reject),
  )
}
function checkedWindowsShell(
  resolve: ShellRequirementResolve,
  reject: ShellRequirementReject,
  error: ShellRequirementError,
  stdout: string,
): void {
  if (error && "code" in error && (error.code === "ENOENT" || error.code === "EACCES")) {
    reject(new Error(SHELL_REQUIREMENT_POWERSHELL))
  } else if (error || stdout.trim() !== SHELL_REQUIREMENT_ADD_TYPE_MARKER) {
    reject(new Error(SHELL_REQUIREMENT_ADD_TYPE))
  } else {
    resolve()
  }
}
