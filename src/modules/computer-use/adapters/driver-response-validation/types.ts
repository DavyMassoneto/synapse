import { type Static } from "typebox"
import {
  type COMPUTER_INVALID_RPC,
  type COMPUTER_RAW_APP_SCHEMA,
  type COMPUTER_RAW_ELEMENT_SCHEMA,
  type COMPUTER_RAW_ENVELOPE_SCHEMA,
  type COMPUTER_RAW_MANIFEST_SCHEMA,
  type COMPUTER_RAW_RPC_SCHEMA,
  type COMPUTER_RAW_STATE_SCHEMA,
  type COMPUTER_RAW_TOOLS_SCHEMA,
  type COMPUTER_RAW_WINDOW_SCHEMA,
  type COMPUTER_RPC_NOTIFICATION,
  type COMPUTER_VALID_RPC,
} from "./constants"

export type ComputerRawRpc = Static<typeof COMPUTER_RAW_RPC_SCHEMA>

export type ComputerRawTools = Static<typeof COMPUTER_RAW_TOOLS_SCHEMA>

export type ComputerRawEnvelope = Static<typeof COMPUTER_RAW_ENVELOPE_SCHEMA>

export type ComputerRawState = Static<typeof COMPUTER_RAW_STATE_SCHEMA>

export type ComputerRawWindow = Static<typeof COMPUTER_RAW_WINDOW_SCHEMA>

export type ComputerRawApp = Static<typeof COMPUTER_RAW_APP_SCHEMA>

export type ComputerRawElement = Static<typeof COMPUTER_RAW_ELEMENT_SCHEMA>

export type ComputerRawManifest = Static<typeof COMPUTER_RAW_MANIFEST_SCHEMA>

export interface ComputerValidRpc {
  kind: typeof COMPUTER_VALID_RPC
  response: ComputerRawRpc
}

export interface ComputerInvalidRpc {
  kind: typeof COMPUTER_INVALID_RPC
  message: string
}

export interface ComputerRpcNotification {
  kind: typeof COMPUTER_RPC_NOTIFICATION
}

export type ComputerParsedRpc = ComputerValidRpc | ComputerInvalidRpc | ComputerRpcNotification
