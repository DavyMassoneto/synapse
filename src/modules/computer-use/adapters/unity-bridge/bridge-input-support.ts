import { type ComputerDriverArguments } from "#synapse/modules/computer-use/public/contracts"
import {
  type ComputerUnityBridgeCapture,
  type ComputerUnityBridgeElement,
  type ComputerUnityBridgeElementLookup,
  type ComputerUnityBridgeInputPlan,
  type ComputerUnityBridgePointResult,
} from "./action"
import {
  computerUnityBridgeCaptureCheck,
  computerUnityBridgeElementAt,
  computerUnityBridgeElementCheck,
  computerUnityBridgePixelPoint,
} from "./bridge-point"
import {
  COMPUTER_UNITY_BRIDGE_NOT_POINTER_TEXT,
  COMPUTER_UNITY_BRIDGE_SCROLL_AMOUNT_MAXIMUM,
  COMPUTER_UNITY_BRIDGE_SCROLL_AMOUNT_MINIMUM,
  COMPUTER_UNITY_BRIDGE_SCROLL_STEPS,
  COMPUTER_UNITY_BRIDGE_STRING_EMPTY,
} from "./constants"
import { type ComputerUnityBridgeReady } from "./handshake"
import { computerUnityBridgeKey, computerUnityBridgeScrollDirectionText } from "./keys"
import { isComputerUnityBridgeCapabilityMissing, isComputerUnityBridgeLeftButton } from "./predicates"
import { type ComputerUnityBridgeTarget } from "./types"

export function computerUnityBridgeRefused(message: string): ComputerUnityBridgeInputPlan {
  return { kind: "input-refused", message }
}

export { isComputerUnityBridgeCapabilityMissing, isComputerUnityBridgeLeftButton }

export function computerUnityBridgeElementArgument(
  argumentsValue: ComputerDriverArguments,
  capture?: ComputerUnityBridgeCapture,
): ComputerUnityBridgeElementLookup {
  const index = argumentsValue.element_index
  if (typeof index !== "number") {
    return { kind: "element-absent" }
  }
  return computerUnityBridgeElementAt(index, capture)
}

export function computerUnityBridgeScrollDirection(argumentsValue: ComputerDriverArguments): string {
  const direction = argumentsValue.direction
  if (typeof direction === "string") {
    return computerUnityBridgeScrollDirectionText(direction)
  }
  return COMPUTER_UNITY_BRIDGE_STRING_EMPTY
}

export function computerUnityBridgeScrollAmount(argumentsValue: ComputerDriverArguments): number {
  const amount = argumentsValue.amount
  if (typeof amount !== "number") {
    return COMPUTER_UNITY_BRIDGE_SCROLL_STEPS
  }
  if (amount < COMPUTER_UNITY_BRIDGE_SCROLL_AMOUNT_MINIMUM || amount > COMPUTER_UNITY_BRIDGE_SCROLL_AMOUNT_MAXIMUM) {
    return COMPUTER_UNITY_BRIDGE_SCROLL_STEPS
  }
  return amount
}

export function computerUnityBridgeKeyArgument(argumentsValue: ComputerDriverArguments): string {
  const key = argumentsValue.key
  if (typeof key !== "string") {
    return COMPUTER_UNITY_BRIDGE_STRING_EMPTY
  }
  return computerUnityBridgeKey(key)
}

export function computerUnityBridgePoint(
  target: ComputerUnityBridgeTarget,
  ready: ComputerUnityBridgeReady,
  element: ComputerUnityBridgeElementLookup,
  argumentsValue: ComputerDriverArguments,
  capture?: ComputerUnityBridgeCapture,
): ComputerUnityBridgePointResult {
  if (element.kind === "element-found") {
    return computerUnityBridgeElementPoint(target, ready, element.element, capture)
  }
  return computerUnityBridgeCoordinatePoint(target, ready, argumentsValue.x, argumentsValue.y, capture)
}

export function computerUnityBridgeElementPoint(
  target: ComputerUnityBridgeTarget,
  ready: ComputerUnityBridgeReady,
  element: ComputerUnityBridgeElement,
  capture?: ComputerUnityBridgeCapture,
): ComputerUnityBridgePointResult {
  const check = computerUnityBridgeElementCheck(target, ready, element, capture)
  if (check.kind === "capture-check-refused") {
    return { kind: "point-rejected", message: check.message }
  }
  return { kind: "point-mapped", clientX: element.point.x, clientY: element.point.y }
}

export function computerUnityBridgeCoordinatePoint(
  target: ComputerUnityBridgeTarget,
  ready: ComputerUnityBridgeReady,
  x?: number,
  y?: number,
  capture?: ComputerUnityBridgeCapture,
): ComputerUnityBridgePointResult {
  if (typeof x !== "number" || typeof y !== "number") {
    return { kind: "point-rejected", message: COMPUTER_UNITY_BRIDGE_NOT_POINTER_TEXT }
  }
  const check = computerUnityBridgeCaptureCheck(target, ready, capture)
  if (check.kind === "capture-check-refused") {
    return { kind: "point-rejected", message: check.message }
  }
  return computerUnityBridgePixelPoint(x, y, check.capture, ready)
}
