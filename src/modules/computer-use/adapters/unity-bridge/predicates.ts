import {
  COMPUTER_DRIVER_CAPTURE_TOOLS,
  COMPUTER_DRIVER_INPUT_TOOLS,
  COMPUTER_DRIVER_LEFT_BUTTON,
  type ComputerDriverArguments,
} from "#synapse/modules/computer-use/public/contracts"
import { type ComputerUnityBridgeCapture, type ComputerUnityBridgePointer } from "./action"
import { COMPUTER_UNITY_BRIDGE_GEOMETRY_TOLERANCE_PIXELS, COMPUTER_UNITY_BRIDGE_PROTOCOL_V2 } from "./constants"
import { type ComputerUnityBridgeFacts, type ComputerUnityBridgeReady } from "./handshake"
import {
  type ComputerUnityBridgeRectangle,
  type ComputerUnityBridgeSize,
  type ComputerUnityBridgeTarget,
} from "./types"

export function isComputerUnityBridgeInputTool(name: string): boolean {
  return COMPUTER_DRIVER_INPUT_TOOLS.includes(name)
}

export function isComputerUnityBridgeCaptureTool(name: string): boolean {
  return COMPUTER_DRIVER_CAPTURE_TOOLS.includes(name)
}

export function isComputerUnityBridgeSameTarget(
  left: ComputerUnityBridgeTarget,
  right: ComputerUnityBridgeTarget,
): boolean {
  return left.pid === right.pid && left.windowId === right.windowId
}

export function hasComputerUnityBridgeFreshCapture(
  capture: ComputerUnityBridgeCapture,
  facts: ComputerUnityBridgeFacts,
): boolean {
  const recorded = capture.facts
  if (!recorded) {
    return false
  }
  return (
    recorded.instance === facts.instance &&
    isComputerUnityBridgeSameRectangle(recorded.geometry.client, facts.geometry.client) &&
    recorded.screen.width === facts.screen.width &&
    recorded.screen.height === facts.screen.height
  )
}

export function isComputerUnityBridgeSameRectangle(
  left: ComputerUnityBridgeRectangle,
  right: ComputerUnityBridgeRectangle,
): boolean {
  return left.x === right.x && left.y === right.y && left.width === right.width && left.height === right.height
}

export function isComputerUnityBridgeImageUsable(
  image: ComputerUnityBridgeSize,
  client: ComputerUnityBridgeRectangle,
): boolean {
  return image.width > 0 && image.height > 0 && client.width > 0 && client.height > 0
}

export function isComputerUnityBridgeImageCoveragePlausible(
  spanHeight: number,
  clientHeight: number,
  captionOffset: number,
): boolean {
  return (
    spanHeight >= clientHeight - COMPUTER_UNITY_BRIDGE_GEOMETRY_TOLERANCE_PIXELS &&
    spanHeight <= clientHeight + captionOffset + COMPUTER_UNITY_BRIDGE_GEOMETRY_TOLERANCE_PIXELS
  )
}

export function hasComputerUnityBridgePointInsideImage(
  pointer: ComputerUnityBridgePointer,
  image: ComputerUnityBridgeSize,
): boolean {
  return pointer.x >= 0 && pointer.y >= 0 && pointer.x <= image.width && pointer.y <= image.height
}

export function hasComputerUnityBridgePointInsideClient(
  clientX: number,
  clientY: number,
  client: ComputerUnityBridgeRectangle,
): boolean {
  return clientX >= 0 && clientY >= 0 && clientX <= client.width && clientY <= client.height
}

export function isComputerUnityBridgeCapabilityMissing(ready: ComputerUnityBridgeReady, capability: boolean): boolean {
  return ready.facts.protocol < COMPUTER_UNITY_BRIDGE_PROTOCOL_V2 || !capability
}

export function isComputerUnityBridgeLeftButton(argumentsValue: ComputerDriverArguments): boolean {
  if (typeof argumentsValue.button !== "string") {
    return true
  }
  return argumentsValue.button === COMPUTER_DRIVER_LEFT_BUTTON
}
