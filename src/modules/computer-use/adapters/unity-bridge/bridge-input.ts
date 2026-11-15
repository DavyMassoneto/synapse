import { type ComputerDriverArguments } from "#synapse/modules/computer-use/public/contracts"
import {
  type ComputerUnityBridgeCapture,
  type ComputerUnityBridgeElement,
  type ComputerUnityBridgeElementLookup,
  type ComputerUnityBridgeInputPlan,
} from "./action"
import {
  computerUnityBridgeDragInput,
  computerUnityBridgeKeyInput,
  computerUnityBridgeOtherInput,
  computerUnityBridgeScrollInput,
  computerUnityBridgeSetValueInput,
  computerUnityBridgeTextInput,
} from "./bridge-input-gestures"
import {
  computerUnityBridgeElementArgument,
  computerUnityBridgeElementPoint,
  computerUnityBridgePoint,
  computerUnityBridgeRefused,
  isComputerUnityBridgeLeftButton,
} from "./bridge-input-support"
import { computerUnityBridgeClickRequest, computerUnityBridgeElementClickRequest } from "./bridge-request"
import {
  COMPUTER_UNITY_BRIDGE_CLICK_TOOL,
  COMPUTER_UNITY_BRIDGE_DRAG_TOOL,
  COMPUTER_UNITY_BRIDGE_HOTKEY_TEXT,
  COMPUTER_UNITY_BRIDGE_HOTKEY_TOOL,
  COMPUTER_UNITY_BRIDGE_KEY_TOOL,
  COMPUTER_UNITY_BRIDGE_MODIFIERS_TEXT,
  COMPUTER_UNITY_BRIDGE_PROTOCOL_V2,
  COMPUTER_UNITY_BRIDGE_SCROLL_TOOL,
  COMPUTER_UNITY_BRIDGE_SET_VALUE_TOOL,
  COMPUTER_UNITY_BRIDGE_TYPE_TOOL,
  COMPUTER_UNITY_BRIDGE_UNSUPPORTED_TEXT,
} from "./constants"
import { type ComputerUnityBridgeReady } from "./handshake"
import { hasComputerUnityBridgeModifiers } from "./predicates"
import { type ComputerUnityBridgeTarget } from "./types"

export function computerUnityBridgeInputPlan(
  name: string,
  argumentsValue: ComputerDriverArguments,
  target: ComputerUnityBridgeTarget,
  ready: ComputerUnityBridgeReady,
  capture?: ComputerUnityBridgeCapture,
): ComputerUnityBridgeInputPlan {
  if (hasComputerUnityBridgeModifiers(argumentsValue)) {
    return computerUnityBridgeRefused(COMPUTER_UNITY_BRIDGE_MODIFIERS_TEXT)
  }
  const element = computerUnityBridgeElementArgument(argumentsValue, capture)
  switch (name) {
    case COMPUTER_UNITY_BRIDGE_CLICK_TOOL:
      return computerUnityBridgeClickInput(target, ready, element, argumentsValue, capture)
    case COMPUTER_UNITY_BRIDGE_SCROLL_TOOL:
      return computerUnityBridgeScrollInput(target, ready, element, argumentsValue, capture)
    case COMPUTER_UNITY_BRIDGE_DRAG_TOOL:
      return computerUnityBridgeDragInput(target, ready, argumentsValue, capture)
    case COMPUTER_UNITY_BRIDGE_TYPE_TOOL:
      return computerUnityBridgeTextInput(ready, element, argumentsValue)
    case COMPUTER_UNITY_BRIDGE_KEY_TOOL:
      return computerUnityBridgeKeyInput(ready, argumentsValue)
    case COMPUTER_UNITY_BRIDGE_HOTKEY_TOOL:
      return computerUnityBridgeRefused(COMPUTER_UNITY_BRIDGE_HOTKEY_TEXT)
    case COMPUTER_UNITY_BRIDGE_SET_VALUE_TOOL:
      return computerUnityBridgeSetValueInput(element)
    default:
      return computerUnityBridgeOtherInput(element)
  }
}

function computerUnityBridgeClickInput(
  target: ComputerUnityBridgeTarget,
  ready: ComputerUnityBridgeReady,
  element: ComputerUnityBridgeElementLookup,
  argumentsValue: ComputerDriverArguments,
  capture?: ComputerUnityBridgeCapture,
): ComputerUnityBridgeInputPlan {
  if (element.kind === "element-absent") {
    return computerUnityBridgeCoordinateClick(target, ready, argumentsValue, capture)
  }
  return computerUnityBridgeElementClick(target, ready, element.element, argumentsValue, capture)
}

function computerUnityBridgeElementClick(
  target: ComputerUnityBridgeTarget,
  ready: ComputerUnityBridgeReady,
  element: ComputerUnityBridgeElement,
  argumentsValue: ComputerDriverArguments,
  capture?: ComputerUnityBridgeCapture,
): ComputerUnityBridgeInputPlan {
  if (!isComputerUnityBridgeLeftButton(argumentsValue)) {
    return computerUnityBridgeRefused(COMPUTER_UNITY_BRIDGE_UNSUPPORTED_TEXT)
  }
  const point = computerUnityBridgeElementPoint(target, ready, element, capture)
  if (point.kind === "point-rejected") {
    return computerUnityBridgeRefused(point.message)
  }
  if (ready.facts.protocol >= COMPUTER_UNITY_BRIDGE_PROTOCOL_V2 && ready.facts.capabilities.ids && element.id) {
    return {
      kind: "input-request",
      request: computerUnityBridgeElementClickRequest(ready.token, element.id, ready.facts.generation),
    }
  }
  return {
    kind: "input-request",
    request: computerUnityBridgeClickRequest(ready.token, element.point.x, element.point.y),
  }
}

function computerUnityBridgeCoordinateClick(
  target: ComputerUnityBridgeTarget,
  ready: ComputerUnityBridgeReady,
  argumentsValue: ComputerDriverArguments,
  capture?: ComputerUnityBridgeCapture,
): ComputerUnityBridgeInputPlan {
  if (typeof argumentsValue.element_index === "number" || !isComputerUnityBridgeLeftButton(argumentsValue)) {
    return { kind: "input-native" }
  }
  const point = computerUnityBridgePoint(target, ready, { kind: "element-absent" }, argumentsValue, capture)
  if (point.kind === "point-rejected") {
    return computerUnityBridgeRefused(point.message)
  }
  return {
    kind: "input-request",
    request: computerUnityBridgeClickRequest(ready.token, point.clientX, point.clientY),
  }
}
