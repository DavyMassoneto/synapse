import { type ComputerDriverArguments } from "#synapse/modules/computer-use/public/contracts"
import {
  type ComputerUnityBridgeCapture,
  type ComputerUnityBridgeElement,
  type ComputerUnityBridgeElementLookup,
  type ComputerUnityBridgeInputPlan,
  type ComputerUnityBridgePointResult,
} from "./action"
import {
  computerUnityBridgeCoordinatePoint,
  computerUnityBridgeElementPoint,
  computerUnityBridgeKeyArgument,
  computerUnityBridgePoint,
  computerUnityBridgeRefused,
  computerUnityBridgeScrollAmount,
  computerUnityBridgeScrollDirection,
  isComputerUnityBridgeCapabilityMissing,
} from "./bridge-input-support"
import { computerUnityBridgeElementAt } from "./bridge-point"
import {
  computerUnityBridgeDragRequest,
  computerUnityBridgeKeyRequest,
  computerUnityBridgeScrollRequest,
  computerUnityBridgeTextRequest,
} from "./bridge-request"
import {
  COMPUTER_UNITY_BRIDGE_KEY_UNSUPPORTED_TEXT,
  COMPUTER_UNITY_BRIDGE_MIXED_DRAG_TEXT,
  COMPUTER_UNITY_BRIDGE_PROTOCOL_V1_TEXT,
  COMPUTER_UNITY_BRIDGE_SCROLL_INVALID_TEXT,
  COMPUTER_UNITY_BRIDGE_SET_VALUE_TEXT,
  COMPUTER_UNITY_BRIDGE_TEXT_MAX_CHARS,
  COMPUTER_UNITY_BRIDGE_TEXT_TOO_LONG_TEXT,
  COMPUTER_UNITY_BRIDGE_UNSUPPORTED_TEXT,
} from "./constants"
import { type ComputerUnityBridgeReady } from "./handshake"
import { type ComputerUnityBridgeTarget } from "./types"

export function computerUnityBridgeScrollInput(
  target: ComputerUnityBridgeTarget,
  ready: ComputerUnityBridgeReady,
  element: ComputerUnityBridgeElementLookup,
  argumentsValue: ComputerDriverArguments,
  capture?: ComputerUnityBridgeCapture,
): ComputerUnityBridgeInputPlan {
  if (isComputerUnityBridgeCapabilityMissing(ready, ready.facts.capabilities.scroll)) {
    return computerUnityBridgeRefused(COMPUTER_UNITY_BRIDGE_PROTOCOL_V1_TEXT)
  }
  const direction = computerUnityBridgeScrollDirection(argumentsValue)
  if (!direction) {
    return computerUnityBridgeRefused(COMPUTER_UNITY_BRIDGE_SCROLL_INVALID_TEXT)
  }
  const point = computerUnityBridgePoint(target, ready, element, argumentsValue, capture)
  if (point.kind === "point-rejected") {
    return computerUnityBridgeRefused(point.message)
  }
  return {
    kind: "input-request",
    request: computerUnityBridgeScrollRequest(
      ready.token,
      point.clientX,
      point.clientY,
      direction,
      computerUnityBridgeScrollAmount(argumentsValue),
    ),
  }
}

export function computerUnityBridgeDragInput(
  target: ComputerUnityBridgeTarget,
  ready: ComputerUnityBridgeReady,
  argumentsValue: ComputerDriverArguments,
  capture?: ComputerUnityBridgeCapture,
): ComputerUnityBridgeInputPlan {
  if (isComputerUnityBridgeCapabilityMissing(ready, ready.facts.capabilities.drag)) {
    return computerUnityBridgeRefused(COMPUTER_UNITY_BRIDGE_PROTOCOL_V1_TEXT)
  }
  const fromIndex = argumentsValue.from_element
  const toIndex = argumentsValue.to_element
  if (typeof fromIndex === "number" && typeof toIndex === "number") {
    return computerUnityBridgeElementDrag(target, ready, fromIndex, toIndex, capture)
  }
  if (typeof fromIndex === "number" || typeof toIndex === "number") {
    return { kind: "input-native" }
  }
  return computerUnityBridgeCoordinateDrag(target, ready, argumentsValue, capture)
}

function computerUnityBridgeElementDrag(
  target: ComputerUnityBridgeTarget,
  ready: ComputerUnityBridgeReady,
  fromIndex: number,
  toIndex: number,
  capture?: ComputerUnityBridgeCapture,
): ComputerUnityBridgeInputPlan {
  const from = computerUnityBridgeElementAt(fromIndex, capture)
  const to = computerUnityBridgeElementAt(toIndex, capture)
  if (from.kind === "element-found" && to.kind === "element-found") {
    return computerUnityBridgeElementDragPlan(target, ready, from.element, to.element, capture)
  }
  if (from.kind === "element-found" || to.kind === "element-found") {
    return computerUnityBridgeRefused(COMPUTER_UNITY_BRIDGE_MIXED_DRAG_TEXT)
  }
  return { kind: "input-native" }
}

function computerUnityBridgeElementDragPlan(
  target: ComputerUnityBridgeTarget,
  ready: ComputerUnityBridgeReady,
  fromElement: ComputerUnityBridgeElement,
  toElement: ComputerUnityBridgeElement,
  capture?: ComputerUnityBridgeCapture,
): ComputerUnityBridgeInputPlan {
  const from = computerUnityBridgeElementPoint(target, ready, fromElement, capture)
  if (from.kind === "point-rejected") {
    return computerUnityBridgeRefused(from.message)
  }
  const to = computerUnityBridgeElementPoint(target, ready, toElement, capture)
  return computerUnityBridgeDragPlan(ready, from, to)
}

function computerUnityBridgeCoordinateDrag(
  target: ComputerUnityBridgeTarget,
  ready: ComputerUnityBridgeReady,
  argumentsValue: ComputerDriverArguments,
  capture?: ComputerUnityBridgeCapture,
): ComputerUnityBridgeInputPlan {
  const from = computerUnityBridgeCoordinatePoint(target, ready, argumentsValue.from_x, argumentsValue.from_y, capture)
  if (from.kind === "point-rejected") {
    return computerUnityBridgeRefused(from.message)
  }
  const to = computerUnityBridgeCoordinatePoint(target, ready, argumentsValue.to_x, argumentsValue.to_y, capture)
  return computerUnityBridgeDragPlan(ready, from, to)
}

function computerUnityBridgeDragPlan(
  ready: ComputerUnityBridgeReady,
  from: ComputerUnityBridgePointResult,
  to: ComputerUnityBridgePointResult,
): ComputerUnityBridgeInputPlan {
  if (from.kind === "point-rejected") {
    return computerUnityBridgeRefused(from.message)
  }
  if (to.kind === "point-rejected") {
    return computerUnityBridgeRefused(to.message)
  }
  return {
    kind: "input-request",
    request: computerUnityBridgeDragRequest(ready.token, from.clientX, from.clientY, to.clientX, to.clientY),
  }
}

export function computerUnityBridgeTextInput(
  ready: ComputerUnityBridgeReady,
  element: ComputerUnityBridgeElementLookup,
  argumentsValue: ComputerDriverArguments,
): ComputerUnityBridgeInputPlan {
  if (isComputerUnityBridgeCapabilityMissing(ready, ready.facts.capabilities.text)) {
    return computerUnityBridgeRefused(COMPUTER_UNITY_BRIDGE_PROTOCOL_V1_TEXT)
  }
  const text = argumentsValue.text
  if (typeof text !== "string" || text.length > COMPUTER_UNITY_BRIDGE_TEXT_MAX_CHARS) {
    return computerUnityBridgeRefused(COMPUTER_UNITY_BRIDGE_TEXT_TOO_LONG_TEXT)
  }
  if (element.kind === "element-found") {
    return {
      kind: "input-request",
      request: computerUnityBridgeTextRequest(ready.token, text, element.element.point.x, element.element.point.y),
    }
  }
  return { kind: "input-request", request: computerUnityBridgeTextRequest(ready.token, text) }
}

export function computerUnityBridgeKeyInput(
  ready: ComputerUnityBridgeReady,
  argumentsValue: ComputerDriverArguments,
): ComputerUnityBridgeInputPlan {
  if (isComputerUnityBridgeCapabilityMissing(ready, ready.facts.capabilities.key)) {
    return computerUnityBridgeRefused(COMPUTER_UNITY_BRIDGE_PROTOCOL_V1_TEXT)
  }
  const key = computerUnityBridgeKeyArgument(argumentsValue)
  if (!key) {
    return computerUnityBridgeRefused(COMPUTER_UNITY_BRIDGE_KEY_UNSUPPORTED_TEXT)
  }
  return { kind: "input-request", request: computerUnityBridgeKeyRequest(ready.token, key) }
}

export function computerUnityBridgeSetValueInput(
  element: ComputerUnityBridgeElementLookup,
): ComputerUnityBridgeInputPlan {
  if (element.kind === "element-found") {
    return computerUnityBridgeRefused(COMPUTER_UNITY_BRIDGE_SET_VALUE_TEXT)
  }
  return { kind: "input-native" }
}

export function computerUnityBridgeOtherInput(element: ComputerUnityBridgeElementLookup): ComputerUnityBridgeInputPlan {
  if (element.kind === "element-found") {
    return computerUnityBridgeRefused(COMPUTER_UNITY_BRIDGE_UNSUPPORTED_TEXT)
  }
  return { kind: "input-native" }
}
