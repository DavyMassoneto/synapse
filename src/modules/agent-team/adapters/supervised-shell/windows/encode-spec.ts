import { type SupervisedShellSpec } from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { type ShellWireEnvironmentEntry, type ShellWireSpec } from "../wire"
import { WINDOWS_SHELL_INVALID, WINDOWS_SHELL_MAX_BYTES } from "./constants"

export function encodeWindowsShellSpec(spec: SupervisedShellSpec): Buffer {
  const environment: ShellWireEnvironmentEntry[] = []
  for (const [name, value] of Object.entries(spec.environment)) {
    if (typeof value === "string") {
      environment.push({ name, value })
    }
  }
  const wire: ShellWireSpec = { ...spec, environment }
  const serialized = JSON.stringify(wire)
  const bytes = Buffer.byteLength(serialized)
  if (bytes > WINDOWS_SHELL_MAX_BYTES) {
    throw new Error(WINDOWS_SHELL_INVALID)
  }
  const body = Buffer.from(serialized)
  return body
}
