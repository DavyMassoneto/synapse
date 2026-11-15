import { Value } from "typebox/value"
import {
  COMPUTER_DRIVER_DISCONNECTED,
  COMPUTER_DRIVER_INVALID,
  COMPUTER_DRIVER_RESPONSE,
  COMPUTER_DRIVER_TIMEOUT,
  COMPUTER_IMAGE_ABSENT,
  type ComputerDriverCallResult,
  type ComputerDriverEnvelope,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerUnityBridgeActionRecord, type ComputerUnityBridgeActionResult } from "./action"
import { computerUnityBridgeDispatched } from "./bridge-evidence"
import {
  COMPUTER_UNITY_BRIDGE_APP_END_TEXT,
  COMPUTER_UNITY_BRIDGE_APP_TEXT,
  COMPUTER_UNITY_BRIDGE_ATTACH_DETAIL_TEXT,
  COMPUTER_UNITY_BRIDGE_DISPATCHED_STATUS,
  COMPUTER_UNITY_BRIDGE_ERROR_TEXT,
  COMPUTER_UNITY_BRIDGE_INVALID_RESPONSE_TEXT,
  COMPUTER_UNITY_BRIDGE_NO_BRIDGE_TEXT,
  COMPUTER_UNITY_BRIDGE_OUTCOME_UNKNOWN_STATUS,
  COMPUTER_UNITY_BRIDGE_REASON_ABSENT,
  COMPUTER_UNITY_BRIDGE_REFUSED_STATUS,
  COMPUTER_UNITY_BRIDGE_REFUSED_TEXT,
  COMPUTER_UNITY_BRIDGE_ROUTE_TEXT,
  COMPUTER_UNITY_BRIDGE_STRING_EMPTY,
  COMPUTER_UNITY_BRIDGE_TRANSPORT_UNKNOWN_TEXT,
  COMPUTER_UNITY_BRIDGE_UNAVAILABLE_TEXT,
  COMPUTER_UNITY_BRIDGE_UNKNOWN_ACTION_STATUS_TEXT,
  COMPUTER_UNITY_BRIDGE_UNKNOWN_TEXT,
  COMPUTER_UNITY_BRIDGE_WINDOW_TEXT,
} from "./constants"
import { COMPUTER_UNITY_BRIDGE_ACTION_SCHEMA } from "./schemas"
import { type ComputerUnityBridgeTarget, type ComputerUnityBridgeTransportResult } from "./types"

export function computerUnityBridgeRejection(message: string): ComputerDriverCallResult {
  return { kind: COMPUTER_DRIVER_RESPONSE, envelope: computerUnityBridgeEnvelope(message, true) }
}

export function computerUnityBridgeUnavailable(
  target: ComputerUnityBridgeTarget,
  detail: string,
): ComputerDriverCallResult {
  const prefix = `${COMPUTER_UNITY_BRIDGE_UNAVAILABLE_TEXT}${COMPUTER_UNITY_BRIDGE_APP_TEXT}${target.pid}`
  const message = `${prefix}${COMPUTER_UNITY_BRIDGE_WINDOW_TEXT}${target.windowId}${COMPUTER_UNITY_BRIDGE_APP_END_TEXT}`
  return computerUnityBridgeRejection(
    `${message}${COMPUTER_UNITY_BRIDGE_NO_BRIDGE_TEXT}${COMPUTER_UNITY_BRIDGE_ATTACH_DETAIL_TEXT}${detail}`,
  )
}

export function computerUnityBridgeTransportResult(
  response: ComputerUnityBridgeTransportResult,
): ComputerDriverCallResult {
  if (response.kind === "transport-timeout") {
    return { kind: COMPUTER_DRIVER_TIMEOUT, message: COMPUTER_UNITY_BRIDGE_TRANSPORT_UNKNOWN_TEXT }
  }
  if (response.kind === "transport-failure") {
    return { kind: COMPUTER_DRIVER_DISCONNECTED, message: response.message }
  }
  return { kind: COMPUTER_DRIVER_INVALID, message: COMPUTER_UNITY_BRIDGE_INVALID_RESPONSE_TEXT }
}

export function computerUnityBridgeActionParse(body: string): ComputerUnityBridgeActionResult {
  try {
    const record = Value.Parse(COMPUTER_UNITY_BRIDGE_ACTION_SCHEMA, JSON.parse(body))
    return { kind: "action-parsed", record }
  } catch {
    return { kind: "action-invalid", message: COMPUTER_UNITY_BRIDGE_INVALID_RESPONSE_TEXT }
  }
}

export function computerUnityBridgeActionTransportResult(
  response: ComputerUnityBridgeTransportResult,
): ComputerDriverCallResult {
  if (response.kind !== "transport-response") {
    return computerUnityBridgeTransportResult(response)
  }
  const parsed = computerUnityBridgeActionParse(response.body)
  if (parsed.kind === "action-invalid") {
    return { kind: COMPUTER_DRIVER_INVALID, message: parsed.message }
  }
  return computerUnityBridgeActionResult(parsed.record)
}

export function computerUnityBridgeActionResult(record: ComputerUnityBridgeActionRecord): ComputerDriverCallResult {
  if (record.status === COMPUTER_UNITY_BRIDGE_DISPATCHED_STATUS) {
    return computerUnityBridgeDispatched(record)
  }
  if (record.status === COMPUTER_UNITY_BRIDGE_REFUSED_STATUS) {
    return computerUnityBridgeRejection(computerUnityBridgeStatusMessage(COMPUTER_UNITY_BRIDGE_REFUSED_TEXT, record))
  }
  if (record.status === COMPUTER_UNITY_BRIDGE_OUTCOME_UNKNOWN_STATUS) {
    return {
      kind: COMPUTER_DRIVER_TIMEOUT,
      message: computerUnityBridgeStatusMessage(COMPUTER_UNITY_BRIDGE_UNKNOWN_TEXT, record),
    }
  }
  if (record.status === COMPUTER_UNITY_BRIDGE_STRING_EMPTY) {
    return { kind: COMPUTER_DRIVER_INVALID, message: COMPUTER_UNITY_BRIDGE_UNKNOWN_ACTION_STATUS_TEXT }
  }
  return {
    kind: COMPUTER_DRIVER_RESPONSE,
    envelope: computerUnityBridgeEnvelope(
      computerUnityBridgeStatusMessage(COMPUTER_UNITY_BRIDGE_ERROR_TEXT, record),
      true,
    ),
  }
}

function computerUnityBridgeEnvelope(message: string, isError: boolean): ComputerDriverEnvelope {
  return {
    message,
    isError,
    windows: [],
    applications: [],
    elements: [],
    tree: COMPUTER_UNITY_BRIDGE_STRING_EMPTY,
    image: { kind: COMPUTER_IMAGE_ABSENT },
  }
}

function computerUnityBridgeStatusMessage(base: string, record: ComputerUnityBridgeActionRecord): string {
  return `${COMPUTER_UNITY_BRIDGE_ROUTE_TEXT}${base}${computerUnityBridgeReason(record)}`
}

function computerUnityBridgeReason(record: ComputerUnityBridgeActionRecord): string {
  if (record.reason) {
    return record.reason
  }
  if (record.detail) {
    return record.detail
  }
  return COMPUTER_UNITY_BRIDGE_REASON_ABSENT
}
