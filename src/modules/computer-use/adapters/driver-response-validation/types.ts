import { type Static } from "typebox"
import {
  type COMPUTER_RAW_APP_SCHEMA,
  type COMPUTER_RAW_ELEMENT_SCHEMA,
  type COMPUTER_RAW_ENVELOPE_SCHEMA,
  type COMPUTER_RAW_MANIFEST_SCHEMA,
  type COMPUTER_RAW_RPC_SCHEMA,
  type COMPUTER_RAW_STATE_SCHEMA,
  type COMPUTER_RAW_TOOLS_SCHEMA,
  type COMPUTER_RAW_WINDOW_SCHEMA,
} from "./schemas"

export type ComputerRawRpc = Static<typeof COMPUTER_RAW_RPC_SCHEMA>

export type ComputerRawTools = Static<typeof COMPUTER_RAW_TOOLS_SCHEMA>

export type ComputerRawEnvelope = Static<typeof COMPUTER_RAW_ENVELOPE_SCHEMA>

export type ComputerRawState = Static<typeof COMPUTER_RAW_STATE_SCHEMA>

export type ComputerRawWindow = Static<typeof COMPUTER_RAW_WINDOW_SCHEMA>

export type ComputerRawApp = Static<typeof COMPUTER_RAW_APP_SCHEMA>

export type ComputerRawElement = Static<typeof COMPUTER_RAW_ELEMENT_SCHEMA>

export type ComputerRawManifest = Static<typeof COMPUTER_RAW_MANIFEST_SCHEMA>

export interface ComputerValidRpc {
  kind: "valid-rpc"
  response: ComputerRawRpc
}

export interface ComputerInvalidRpc {
  kind: "invalid-rpc"
  message: string
}

export interface ComputerRpcNotification {
  kind: "rpc-notification"
}

export type ComputerParsedRpc = ComputerValidRpc | ComputerInvalidRpc | ComputerRpcNotification
