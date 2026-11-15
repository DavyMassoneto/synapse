import {
  type ComputerUnityBridgeCapture,
  type ComputerUnityBridgeCaptureCheck,
  type ComputerUnityBridgeElement,
  type ComputerUnityBridgeElementLookup,
  type ComputerUnityBridgePointResult,
} from "./action"
import {
  COMPUTER_UNITY_BRIDGE_NO_CAPTURE_TEXT,
  COMPUTER_UNITY_BRIDGE_STALE_CAPTURE_TEXT,
  COMPUTER_UNITY_BRIDGE_STALE_GENERATION_TEXT,
} from "./constants"
import { computerUnityBridgeClientPoint } from "./geometry"
import { type ComputerUnityBridgeReady } from "./handshake"
import { hasComputerUnityBridgeFreshCapture, isComputerUnityBridgeSameTarget } from "./predicates"
import { type ComputerUnityBridgeTarget } from "./types"

export function computerUnityBridgeRefusedCapture(message: string): ComputerUnityBridgeCaptureCheck {
  return { kind: "capture-check-refused", message }
}

export function computerUnityBridgeCaptureCheck(
  target: ComputerUnityBridgeTarget,
  ready: ComputerUnityBridgeReady,
  capture?: ComputerUnityBridgeCapture,
): ComputerUnityBridgeCaptureCheck {
  if (!capture) {
    return computerUnityBridgeRefusedCapture(COMPUTER_UNITY_BRIDGE_NO_CAPTURE_TEXT)
  }
  if (!capture.facts) {
    return computerUnityBridgeRefusedCapture(COMPUTER_UNITY_BRIDGE_NO_CAPTURE_TEXT)
  }
  if (!isComputerUnityBridgeSameTarget(capture.target, target)) {
    return computerUnityBridgeRefusedCapture(COMPUTER_UNITY_BRIDGE_NO_CAPTURE_TEXT)
  }
  if (!hasComputerUnityBridgeFreshCapture(capture, ready.facts)) {
    return computerUnityBridgeRefusedCapture(COMPUTER_UNITY_BRIDGE_STALE_CAPTURE_TEXT)
  }
  return { kind: "capture-check-valid", capture }
}

export function computerUnityBridgeElementCheck(
  target: ComputerUnityBridgeTarget,
  ready: ComputerUnityBridgeReady,
  element: ComputerUnityBridgeElement,
  capture?: ComputerUnityBridgeCapture,
): ComputerUnityBridgeCaptureCheck {
  const check = computerUnityBridgeCaptureCheck(target, ready, capture)
  if (check.kind === "capture-check-refused") {
    return check
  }
  if (check.capture.generation !== ready.facts.generation || element.generation !== ready.facts.generation) {
    return computerUnityBridgeRefusedCapture(COMPUTER_UNITY_BRIDGE_STALE_GENERATION_TEXT)
  }
  return check
}

export function computerUnityBridgePixelPoint(
  x: number,
  y: number,
  capture: ComputerUnityBridgeCapture,
  ready: ComputerUnityBridgeReady,
): ComputerUnityBridgePointResult {
  return computerUnityBridgeClientPoint({ x, y }, capture.image, ready.facts.geometry)
}

export function computerUnityBridgeElementAt(
  index: number,
  capture?: ComputerUnityBridgeCapture,
): ComputerUnityBridgeElementLookup {
  if (!capture) {
    return { kind: "element-absent" }
  }
  for (const element of capture.elements) {
    if (element.index === index) {
      return { kind: "element-found", element }
    }
  }
  return { kind: "element-absent" }
}
