import { type ComputerUnityBridgeRequest } from "./action"
import {
  COMPUTER_UNITY_BRIDGE_CLICK_OP,
  COMPUTER_UNITY_BRIDGE_DRAG_OP,
  COMPUTER_UNITY_BRIDGE_DRAG_STEPS,
  COMPUTER_UNITY_BRIDGE_HOVER,
  COMPUTER_UNITY_BRIDGE_KEY_OP,
  COMPUTER_UNITY_BRIDGE_PING_OP,
  COMPUTER_UNITY_BRIDGE_SCROLL_OP,
  COMPUTER_UNITY_BRIDGE_TEXT_OP,
} from "./constants"

export function computerUnityBridgePingRequest(token: string): ComputerUnityBridgeRequest {
  return { op: COMPUTER_UNITY_BRIDGE_PING_OP, token }
}

export function computerUnityBridgeClickRequest(
  token: string,
  clientX: number,
  clientY: number,
): ComputerUnityBridgeRequest {
  return {
    op: COMPUTER_UNITY_BRIDGE_CLICK_OP,
    token,
    x: clientX,
    y: clientY,
    hover: COMPUTER_UNITY_BRIDGE_HOVER,
  }
}

export function computerUnityBridgeElementClickRequest(
  token: string,
  id: string,
  generation: number,
): ComputerUnityBridgeRequest {
  return {
    op: COMPUTER_UNITY_BRIDGE_CLICK_OP,
    token,
    id,
    generation,
    hover: COMPUTER_UNITY_BRIDGE_HOVER,
  }
}

export function computerUnityBridgeScrollRequest(
  token: string,
  clientX: number,
  clientY: number,
  direction: string,
  amount: number,
): ComputerUnityBridgeRequest {
  return {
    op: COMPUTER_UNITY_BRIDGE_SCROLL_OP,
    token,
    x: clientX,
    y: clientY,
    direction,
    amount,
  }
}

export function computerUnityBridgeDragRequest(
  token: string,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): ComputerUnityBridgeRequest {
  return {
    op: COMPUTER_UNITY_BRIDGE_DRAG_OP,
    token,
    from_x: fromX,
    from_y: fromY,
    to_x: toX,
    to_y: toY,
    steps: COMPUTER_UNITY_BRIDGE_DRAG_STEPS,
  }
}

export function computerUnityBridgeTextRequest(
  token: string,
  text: string,
  clientX?: number,
  clientY?: number,
): ComputerUnityBridgeRequest {
  if (typeof clientX === "number" && typeof clientY === "number") {
    return { op: COMPUTER_UNITY_BRIDGE_TEXT_OP, token, text, x: clientX, y: clientY }
  }
  return { op: COMPUTER_UNITY_BRIDGE_TEXT_OP, token, text }
}

export function computerUnityBridgeKeyRequest(token: string, key: string): ComputerUnityBridgeRequest {
  return { op: COMPUTER_UNITY_BRIDGE_KEY_OP, token, key }
}
