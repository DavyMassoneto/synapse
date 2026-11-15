import { SHELL_PROBE_DIAGNOSTIC_BYTES } from "./constants"
import { type ShellRequirementError } from "./types"

export function formatShellProbeDiagnostic(error: ShellRequirementError, stdout: string, stderr: string): string {
  let code = "0"
  let signal = "none"
  let killed = false
  if (error) {
    code = "unavailable"
    if ("code" in error && (typeof error.code === "number" || typeof error.code === "string")) {
      code = String(error.code)
    }
    if ("signal" in error && typeof error.signal === "string") {
      signal = error.signal
    }
    killed = "killed" in error && error.killed === true
  }
  return `code=${limitShellProbeText(code)}; signal=${limitShellProbeText(signal)}; killed=${killed}; stderr=${limitShellProbeText(stderr)}; stdout=${limitShellProbeText(stdout)}`
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
