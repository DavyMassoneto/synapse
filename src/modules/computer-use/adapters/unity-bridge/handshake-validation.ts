import {
  COMPUTER_UNITY_BRIDGE_ENDPOINT_PREFIX,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_CAPABILITIES,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_ENDPOINT,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_GEOMETRY,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_PROTOCOL,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_PUMP,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_STATE,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_TARGET,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_WINDOW_CLASS,
  COMPUTER_UNITY_BRIDGE_LISTENING_STATE,
  COMPUTER_UNITY_BRIDGE_PROTOCOL_V1,
  COMPUTER_UNITY_BRIDGE_PROTOCOL_V2,
  COMPUTER_UNITY_BRIDGE_UNITY_WINDOW_CLASS,
} from "./constants"
import { type ComputerUnityBridgeValidation } from "./handshake"
import { type ComputerUnityBridgeHandshakeRecord, type ComputerUnityBridgeTarget } from "./types"

export function computerValidateUnityBridgeHandshake(
  record: ComputerUnityBridgeHandshakeRecord,
  target: ComputerUnityBridgeTarget,
): ComputerUnityBridgeValidation {
  const identity = computerValidateUnityBridgeIdentity(record, target)
  if (identity.kind === "handshake-invalid") {
    return identity
  }
  return computerValidateUnityBridgePump(record)
}

function computerValidateUnityBridgeIdentity(
  record: ComputerUnityBridgeHandshakeRecord,
  target: ComputerUnityBridgeTarget,
): ComputerUnityBridgeValidation {
  if (record.protocol !== COMPUTER_UNITY_BRIDGE_PROTOCOL_V1 && record.protocol !== COMPUTER_UNITY_BRIDGE_PROTOCOL_V2) {
    return { kind: "handshake-invalid", reason: COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_PROTOCOL }
  }
  if (record.state !== COMPUTER_UNITY_BRIDGE_LISTENING_STATE) {
    return { kind: "handshake-invalid", reason: COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_STATE }
  }
  if (record.pid !== target.pid || record.geometry.hwnd !== target.windowId) {
    return { kind: "handshake-invalid", reason: COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_TARGET }
  }
  if (record.geometry.window_class !== COMPUTER_UNITY_BRIDGE_UNITY_WINDOW_CLASS) {
    return { kind: "handshake-invalid", reason: COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_WINDOW_CLASS }
  }
  if (!record.endpoint.startsWith(COMPUTER_UNITY_BRIDGE_ENDPOINT_PREFIX)) {
    return { kind: "handshake-invalid", reason: COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_ENDPOINT }
  }
  return { kind: "handshake-valid" }
}

function computerValidateUnityBridgePump(record: ComputerUnityBridgeHandshakeRecord): ComputerUnityBridgeValidation {
  if (!record.gameobject_created || !record.main_thread_captured || !record.event_system) {
    return { kind: "handshake-invalid", reason: COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_PUMP }
  }
  if (!record.capabilities.click) {
    return { kind: "handshake-invalid", reason: COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_CAPABILITIES }
  }
  if (record.geometry.client.w <= 0 || record.geometry.client.h <= 0) {
    return { kind: "handshake-invalid", reason: COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_GEOMETRY }
  }
  return { kind: "handshake-valid" }
}
