import { fileURLToPath } from "node:url"
import {
  COMPUTER_DRIVER_PROTOCOL_VERSION,
  COMPUTER_RPC_INITIALIZE,
  COMPUTER_RPC_TOOLS_CALL,
  COMPUTER_RPC_TOOLS_LIST,
} from "#synapse/modules"
import {
  COMPUTER_FIXTURE_DRIVER_FILE,
  COMPUTER_FIXTURE_DRIVER_IMPORT_FLAG,
  COMPUTER_FIXTURE_DRIVER_TSX,
} from "./constants"

export function computerIntegrationDriverArguments(): string[] {
  return [
    COMPUTER_FIXTURE_DRIVER_IMPORT_FLAG,
    import.meta.resolve(COMPUTER_FIXTURE_DRIVER_TSX),
    fileURLToPath(new URL(COMPUTER_FIXTURE_DRIVER_FILE, import.meta.url)),
    JSON.stringify({
      initialize: COMPUTER_RPC_INITIALIZE,
      toolsList: COMPUTER_RPC_TOOLS_LIST,
      toolsCall: COMPUTER_RPC_TOOLS_CALL,
      version: COMPUTER_DRIVER_PROTOCOL_VERSION,
    }),
  ]
}
