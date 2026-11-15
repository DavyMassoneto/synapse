import {
  COMPUTER_DRIVER_RESPONSE,
  COMPUTER_EFFECT_UNVERIFIABLE,
  COMPUTER_IMAGE_ABSENT,
  type ComputerDriverCallResult,
  type ComputerDriverEnvelope,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerUnityBridgeActionDesktop, type ComputerUnityBridgeActionRecord } from "./action"
import {
  COMPUTER_UNITY_BRIDGE_BRIDGE_ROUTE_TEXT,
  COMPUTER_UNITY_BRIDGE_CLIENT_POINT_TEXT,
  COMPUTER_UNITY_BRIDGE_CURSOR_MOVED_TEXT,
  COMPUTER_UNITY_BRIDGE_CURSOR_STILL_TEXT,
  COMPUTER_UNITY_BRIDGE_DESKTOP_END,
  COMPUTER_UNITY_BRIDGE_DESKTOP_SEPARATOR,
  COMPUTER_UNITY_BRIDGE_DESKTOP_TEXT,
  COMPUTER_UNITY_BRIDGE_DISPATCHED_TEXT,
  COMPUTER_UNITY_BRIDGE_DRAG_DISPATCHED_TEXT,
  COMPUTER_UNITY_BRIDGE_FOREGROUND_CHANGED_TEXT,
  COMPUTER_UNITY_BRIDGE_FOREGROUND_STILL_TEXT,
  COMPUTER_UNITY_BRIDGE_GENERATION_TEXT,
  COMPUTER_UNITY_BRIDGE_KEY_DISPATCHED_TEXT,
  COMPUTER_UNITY_BRIDGE_KEY_TEXT,
  COMPUTER_UNITY_BRIDGE_MOVED_TEXT,
  COMPUTER_UNITY_BRIDGE_POINT_END,
  COMPUTER_UNITY_BRIDGE_POINT_SEPARATOR,
  COMPUTER_UNITY_BRIDGE_ROUTE_TEXT,
  COMPUTER_UNITY_BRIDGE_SCROLL_AFTER_TEXT,
  COMPUTER_UNITY_BRIDGE_SCROLL_BEFORE_TEXT,
  COMPUTER_UNITY_BRIDGE_SCROLL_DISPATCHED_TEXT,
  COMPUTER_UNITY_BRIDGE_SCROLL_PATH_TEXT,
  COMPUTER_UNITY_BRIDGE_STEPS_TEXT,
  COMPUTER_UNITY_BRIDGE_STRING_EMPTY,
  COMPUTER_UNITY_BRIDGE_TARGET_TEXT,
  COMPUTER_UNITY_BRIDGE_TEXT_DISPATCHED_TEXT,
  COMPUTER_UNITY_BRIDGE_TEXT_LENGTH_TEXT,
  COMPUTER_UNITY_BRIDGE_TEXT_VALUE_TEXT,
  COMPUTER_UNITY_BRIDGE_TRUNCATED_TEXT,
} from "./constants"

export function computerUnityBridgeDispatched(record: ComputerUnityBridgeActionRecord): ComputerDriverCallResult {
  const envelope: ComputerDriverEnvelope = computerUnityBridgeEvidenceEnvelope(
    computerUnityBridgeDispatchedMessage(record),
  )
  envelope.effect = COMPUTER_EFFECT_UNVERIFIABLE
  return { kind: COMPUTER_DRIVER_RESPONSE, envelope }
}

function computerUnityBridgeDispatchedMessage(record: ComputerUnityBridgeActionRecord): string {
  const message = `${COMPUTER_UNITY_BRIDGE_ROUTE_TEXT}${computerUnityBridgeDispatchedText(record)}`
  let evidence = computerUnityBridgeDispatchedEvidence(record)
  if (typeof record.generation === "number") {
    evidence += `${COMPUTER_UNITY_BRIDGE_GENERATION_TEXT}${record.generation}`
  }
  if (record.action_desktop) {
    evidence += computerUnityBridgeDesktopEvidence(record.action_desktop)
  }
  return `${message}${evidence}`
}

function computerUnityBridgeDispatchedText(record: ComputerUnityBridgeActionRecord): string {
  if (record.key) {
    return COMPUTER_UNITY_BRIDGE_KEY_DISPATCHED_TEXT
  }
  if (typeof record.text_length === "number" || typeof record.value_after === "string") {
    return COMPUTER_UNITY_BRIDGE_TEXT_DISPATCHED_TEXT
  }
  if (record.from || record.to) {
    return COMPUTER_UNITY_BRIDGE_DRAG_DISPATCHED_TEXT
  }
  if (record.scroll_delta || record.scroll_rect) {
    return COMPUTER_UNITY_BRIDGE_SCROLL_DISPATCHED_TEXT
  }
  return COMPUTER_UNITY_BRIDGE_DISPATCHED_TEXT
}

function computerUnityBridgeDispatchedEvidence(record: ComputerUnityBridgeActionRecord): string {
  let message = COMPUTER_UNITY_BRIDGE_STRING_EMPTY
  if (record.route) {
    message += `${COMPUTER_UNITY_BRIDGE_BRIDGE_ROUTE_TEXT}${record.route}`
  }
  message += computerUnityBridgeTargetEvidence(record)
  message += computerUnityBridgePointEvidence(record)
  message += computerUnityBridgeScrollEvidence(record)
  message += computerUnityBridgeActionEvidence(record)
  return message
}

function computerUnityBridgeDesktopEvidence(desktop: ComputerUnityBridgeActionDesktop): string {
  let cursor = COMPUTER_UNITY_BRIDGE_CURSOR_STILL_TEXT
  if (desktop.cursor_moved) {
    cursor = COMPUTER_UNITY_BRIDGE_CURSOR_MOVED_TEXT
  }
  let foreground = COMPUTER_UNITY_BRIDGE_FOREGROUND_STILL_TEXT
  if (desktop.foreground_changed) {
    foreground = COMPUTER_UNITY_BRIDGE_FOREGROUND_CHANGED_TEXT
  }
  const separator = COMPUTER_UNITY_BRIDGE_DESKTOP_SEPARATOR
  return `${COMPUTER_UNITY_BRIDGE_DESKTOP_TEXT}${cursor}${separator}${foreground}${COMPUTER_UNITY_BRIDGE_DESKTOP_END}`
}

function computerUnityBridgeTargetEvidence(record: ComputerUnityBridgeActionRecord): string {
  const target = record.target
  if (target?.label) {
    return `${COMPUTER_UNITY_BRIDGE_TARGET_TEXT}${target.label}`
  }
  if (target?.path) {
    return `${COMPUTER_UNITY_BRIDGE_TARGET_TEXT}${target.path}`
  }
  return COMPUTER_UNITY_BRIDGE_STRING_EMPTY
}

function computerUnityBridgePointEvidence(record: ComputerUnityBridgeActionRecord): string {
  let message = COMPUTER_UNITY_BRIDGE_STRING_EMPTY
  if (record.point) {
    message += `${COMPUTER_UNITY_BRIDGE_CLIENT_POINT_TEXT}${record.point.client_x}`
    message += `${COMPUTER_UNITY_BRIDGE_POINT_SEPARATOR}${record.point.client_y}${COMPUTER_UNITY_BRIDGE_POINT_END}`
  }
  if (record.from) {
    message += `${COMPUTER_UNITY_BRIDGE_CLIENT_POINT_TEXT}${record.from.client_x}`
    message += `${COMPUTER_UNITY_BRIDGE_POINT_SEPARATOR}${record.from.client_y}${COMPUTER_UNITY_BRIDGE_POINT_END}`
  }
  if (record.to) {
    message += `${COMPUTER_UNITY_BRIDGE_CLIENT_POINT_TEXT}${record.to.client_x}`
    message += `${COMPUTER_UNITY_BRIDGE_POINT_SEPARATOR}${record.to.client_y}${COMPUTER_UNITY_BRIDGE_POINT_END}`
  }
  if (typeof record.steps === "number") {
    message += `${COMPUTER_UNITY_BRIDGE_STEPS_TEXT}${record.steps}`
  }
  return message
}

function computerUnityBridgeScrollEvidence(record: ComputerUnityBridgeActionRecord): string {
  const scroll = record.scroll_rect
  if (!scroll) {
    return COMPUTER_UNITY_BRIDGE_STRING_EMPTY
  }
  let message = `${COMPUTER_UNITY_BRIDGE_SCROLL_PATH_TEXT}${scroll.path}`
  message += `${COMPUTER_UNITY_BRIDGE_SCROLL_BEFORE_TEXT}${scroll.normalized_before.x}`
  message += `${COMPUTER_UNITY_BRIDGE_POINT_SEPARATOR}${scroll.normalized_before.y}${COMPUTER_UNITY_BRIDGE_POINT_END}`
  message += `${COMPUTER_UNITY_BRIDGE_SCROLL_AFTER_TEXT}${scroll.normalized_after.x}`
  message += `${COMPUTER_UNITY_BRIDGE_POINT_SEPARATOR}${scroll.normalized_after.y}${COMPUTER_UNITY_BRIDGE_POINT_END}`
  return message
}

function computerUnityBridgeActionEvidence(record: ComputerUnityBridgeActionRecord): string {
  let message = COMPUTER_UNITY_BRIDGE_STRING_EMPTY
  if (record.key) {
    message += `${COMPUTER_UNITY_BRIDGE_KEY_TEXT}${record.key}`
  }
  if (record.value_after) {
    message += `${COMPUTER_UNITY_BRIDGE_TEXT_VALUE_TEXT}${record.value_after}`
  }
  if (typeof record.text_length === "number") {
    message += `${COMPUTER_UNITY_BRIDGE_TEXT_LENGTH_TEXT}${record.text_length}`
  }
  if (record.truncated) {
    message += COMPUTER_UNITY_BRIDGE_TRUNCATED_TEXT
  }
  if (record.moved) {
    message += COMPUTER_UNITY_BRIDGE_MOVED_TEXT
  }
  return message
}

function computerUnityBridgeEvidenceEnvelope(message: string): ComputerDriverEnvelope {
  return {
    message,
    isError: false,
    windows: [],
    applications: [],
    elements: [],
    tree: COMPUTER_UNITY_BRIDGE_STRING_EMPTY,
    image: { kind: COMPUTER_IMAGE_ABSENT },
  }
}
