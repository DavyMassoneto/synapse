import {
  COMPUTER_UNITY_BRIDGE_DIRECTION_DOWN,
  COMPUTER_UNITY_BRIDGE_DIRECTION_LEFT,
  COMPUTER_UNITY_BRIDGE_DIRECTION_RIGHT,
  COMPUTER_UNITY_BRIDGE_DIRECTION_UP,
  COMPUTER_UNITY_BRIDGE_KEY_DOWN,
  COMPUTER_UNITY_BRIDGE_KEY_ESCAPE,
  COMPUTER_UNITY_BRIDGE_KEY_LEFT,
  COMPUTER_UNITY_BRIDGE_KEY_RETURN,
  COMPUTER_UNITY_BRIDGE_KEY_RIGHT,
  COMPUTER_UNITY_BRIDGE_KEY_TAB,
  COMPUTER_UNITY_BRIDGE_KEY_UP,
  COMPUTER_UNITY_BRIDGE_STRING_EMPTY,
} from "./constants"

export function computerUnityBridgeKey(key: string): string {
  if (key === "return" || key === "enter") {
    return COMPUTER_UNITY_BRIDGE_KEY_RETURN
  }
  if (key === "escape" || key === "esc") {
    return COMPUTER_UNITY_BRIDGE_KEY_ESCAPE
  }
  if (key === "tab") {
    return COMPUTER_UNITY_BRIDGE_KEY_TAB
  }
  if (key === "up" || key === "arrowup") {
    return COMPUTER_UNITY_BRIDGE_KEY_UP
  }
  if (key === "down" || key === "arrowdown") {
    return COMPUTER_UNITY_BRIDGE_KEY_DOWN
  }
  if (key === "left" || key === "arrowleft") {
    return COMPUTER_UNITY_BRIDGE_KEY_LEFT
  }
  if (key === "right" || key === "arrowright") {
    return COMPUTER_UNITY_BRIDGE_KEY_RIGHT
  }
  return COMPUTER_UNITY_BRIDGE_STRING_EMPTY
}

export function computerUnityBridgeScrollDirectionText(direction: string): string {
  if (direction === COMPUTER_UNITY_BRIDGE_DIRECTION_UP) {
    return COMPUTER_UNITY_BRIDGE_DIRECTION_UP
  }
  if (direction === COMPUTER_UNITY_BRIDGE_DIRECTION_DOWN) {
    return COMPUTER_UNITY_BRIDGE_DIRECTION_DOWN
  }
  if (direction === COMPUTER_UNITY_BRIDGE_DIRECTION_LEFT) {
    return COMPUTER_UNITY_BRIDGE_DIRECTION_LEFT
  }
  if (direction === COMPUTER_UNITY_BRIDGE_DIRECTION_RIGHT) {
    return COMPUTER_UNITY_BRIDGE_DIRECTION_RIGHT
  }
  return COMPUTER_UNITY_BRIDGE_STRING_EMPTY
}
