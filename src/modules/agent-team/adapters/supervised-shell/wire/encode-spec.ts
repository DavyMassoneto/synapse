import { type SupervisedShellSpec } from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { SHELL_WIRE_MAX_SPEC_BYTES } from "./constants"
import { type ShellWireEnvironmentEntry, type ShellWireSpec } from "./types"

export function encodeShellSpec(spec: SupervisedShellSpec, errorText: string): Buffer {
  const environment: ShellWireEnvironmentEntry[] = []
  for (const [name, value] of Object.entries(spec.environment)) {
    if (typeof value === "string") {
      environment.push({ name, value })
    }
  }
  const wire: ShellWireSpec = { ...spec, environment }
  const serialized = JSON.stringify(wire)
  if (Buffer.byteLength(serialized) > SHELL_WIRE_MAX_SPEC_BYTES) {
    throw new Error(errorText)
  }
  return Buffer.from(serialized)
}
