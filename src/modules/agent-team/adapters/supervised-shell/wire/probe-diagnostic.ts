import {
  SHELL_PROBE_CODE_LABEL,
  SHELL_PROBE_CODE_SUCCESS,
  SHELL_PROBE_CODE_UNAVAILABLE,
  SHELL_PROBE_DIAGNOSTIC_BYTES,
  SHELL_PROBE_KILLED_LABEL,
  SHELL_PROBE_PROPERTY_CODE,
  SHELL_PROBE_PROPERTY_KILLED,
  SHELL_PROBE_PROPERTY_SIGNAL,
  SHELL_PROBE_SIGNAL_LABEL,
  SHELL_PROBE_SIGNAL_NONE,
  SHELL_PROBE_STDERR_LABEL,
  SHELL_PROBE_STDOUT_LABEL,
} from "./constants"
import { type ShellRequirementError } from "./types"

export function formatShellProbeDiagnostic(error: ShellRequirementError, stdout: string, stderr: string): string {
  let code = SHELL_PROBE_CODE_SUCCESS
  let signal = SHELL_PROBE_SIGNAL_NONE
  let killed = false
  if (error) {
    code = SHELL_PROBE_CODE_UNAVAILABLE
    if (SHELL_PROBE_PROPERTY_CODE in error && (typeof error.code === "number" || typeof error.code === "string")) {
      code = String(error.code)
    }
    if (SHELL_PROBE_PROPERTY_SIGNAL in error && typeof error.signal === "string") {
      signal = error.signal
    }
    killed = SHELL_PROBE_PROPERTY_KILLED in error && error.killed === true
  }
  return `${SHELL_PROBE_CODE_LABEL}${limitShellProbeText(code)}${SHELL_PROBE_SIGNAL_LABEL}${limitShellProbeText(signal)}${SHELL_PROBE_KILLED_LABEL}${killed}${SHELL_PROBE_STDERR_LABEL}${limitShellProbeText(stderr)}${SHELL_PROBE_STDOUT_LABEL}${limitShellProbeText(stdout)}`
}

export function limitShellProbeText(text: string): string {
  let bytes = 0
  let limited = ""
  for (const character of text) {
    const size = Buffer.byteLength(character)
    if (bytes + size > SHELL_PROBE_DIAGNOSTIC_BYTES) {
      break
    }
    limited += character
    bytes += size
  }
  return limited
}
