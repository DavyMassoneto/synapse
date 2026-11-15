import { type SupervisedShellSpec } from "#synapse/modules/agent-team/public/supervised-shell/contracts"
import { UNIX_KEEPER_INVALID, UNIX_KEEPER_MAX_SPEC_BYTES } from "./constants"
import { type UnixKeeperEnvironmentEntry, type UnixKeeperWireSpec } from "./types"

export function encodeUnixKeeperSpec(spec: SupervisedShellSpec): Buffer {
  const environment: UnixKeeperEnvironmentEntry[] = []
  for (const [name, value] of Object.entries(spec.environment)) {
    if (typeof value === "string") {
      environment.push({ name, value })
    }
  }
  const wire: UnixKeeperWireSpec = { ...spec, environment }
  const serialized = JSON.stringify(wire)
  if (Buffer.byteLength(serialized) > UNIX_KEEPER_MAX_SPEC_BYTES) {
    throw new Error(UNIX_KEEPER_INVALID)
  }
  return Buffer.from(serialized)
}
