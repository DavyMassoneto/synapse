import { execFile } from "node:child_process"
import {
  SHELL_PROBE_DIAGNOSTIC_PREFIX,
  SHELL_PROBE_PROPERTY_CODE,
  SHELL_REQUIREMENT_ACCESS_DENIED_CODE,
  SHELL_REQUIREMENT_ADD_TYPE,
  SHELL_REQUIREMENT_ADD_TYPE_MARKER,
  SHELL_REQUIREMENT_NOT_FOUND_CODE,
  SHELL_REQUIREMENT_POWERSHELL,
  SHELL_REQUIREMENT_PROBE,
  SHELL_REQUIREMENT_PROBE_FLAGS,
  SHELL_REQUIREMENT_PROBE_MS,
  WINDOWS_SHELL_UTF8,
} from "./constants"
import { formatShellProbeDiagnostic } from "./probe-diagnostic"
import {
  type ShellRequirementError,
  type ShellRequirementOptions,
  type ShellRequirementReject,
  type ShellRequirementResolve,
} from "./types"

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
      encoding: WINDOWS_SHELL_UTF8,
      ...(options.signal ? { signal: options.signal } : {}),
    },
    checkedWindowsShell.bind(undefined, resolve, reject),
  )
}
export function checkedWindowsShell(
  resolve: ShellRequirementResolve,
  reject: ShellRequirementReject,
  error: ShellRequirementError,
  stdout: string,
  stderr: string,
): void {
  if (
    error &&
    SHELL_PROBE_PROPERTY_CODE in error &&
    (error.code === SHELL_REQUIREMENT_NOT_FOUND_CODE || error.code === SHELL_REQUIREMENT_ACCESS_DENIED_CODE)
  ) {
    reject(new Error(SHELL_REQUIREMENT_POWERSHELL))
  } else if (error || stdout.trim() !== SHELL_REQUIREMENT_ADD_TYPE_MARKER) {
    reject(
      new Error(
        `${SHELL_REQUIREMENT_ADD_TYPE}${SHELL_PROBE_DIAGNOSTIC_PREFIX}${formatShellProbeDiagnostic(error, stdout, stderr)}`,
      ),
    )
  } else {
    resolve()
  }
}
