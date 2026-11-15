import { type Writable } from "node:stream"
import { type SupervisedWireLease } from "#synapse/modules/agent-team/adapters/supervised-shell/wire"
export interface UnixPreparedProcess {
  lease: SupervisedWireLease
  input: Writable
}
