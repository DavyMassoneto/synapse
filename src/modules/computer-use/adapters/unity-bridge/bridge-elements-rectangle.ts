import { COMPUTER_BOUNDS_KNOWN, type ComputerElement } from "#synapse/modules/computer-use/public/contracts"
import {
  type ComputerUnityBridgeElement,
  type ComputerUnityBridgeElementPair,
  type ComputerUnityBridgeElementPairResult,
  type ComputerUnityBridgeRectangleResult,
} from "./action"
import { COMPUTER_UNITY_BRIDGE_STRING_EMPTY } from "./constants"
import { type ComputerUnityBridgeGeometry, type ComputerUnityBridgeRectangle } from "./types"

function computerUnityBridgeRectangleFound(
  rectangle: ComputerUnityBridgeRectangle,
): ComputerUnityBridgeRectangleResult {
  return { kind: "rectangle-found", rectangle }
}

function computerUnityBridgeRectangleAbsent(): ComputerUnityBridgeRectangleResult {
  return { kind: "rectangle-absent" }
}

export function computerUnityBridgeClientRectangle(
  x?: number,
  y?: number,
  width?: number,
  height?: number,
): ComputerUnityBridgeRectangleResult {
  if (typeof x !== "number" || typeof y !== "number" || typeof width !== "number" || typeof height !== "number") {
    return computerUnityBridgeRectangleAbsent()
  }
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(width) || !Number.isFinite(height)) {
    return computerUnityBridgeRectangleAbsent()
  }
  if (width <= 0 || height <= 0) {
    return computerUnityBridgeRectangleAbsent()
  }
  return computerUnityBridgeRectangleFound({ x, y, width, height })
}

function computerUnityBridgeVisibleRectangle(
  rectangle: ComputerUnityBridgeRectangle,
  client: ComputerUnityBridgeRectangle,
): ComputerUnityBridgeRectangleResult {
  const left = Math.max(rectangle.x, 0)
  const top = Math.max(rectangle.y, 0)
  const right = Math.min(rectangle.x + rectangle.width, client.width)
  const bottom = Math.min(rectangle.y + rectangle.height, client.height)
  if (right <= left || bottom <= top) {
    return computerUnityBridgeRectangleAbsent()
  }
  return computerUnityBridgeRectangleFound({ x: left, y: top, width: right - left, height: bottom - top })
}

export function computerUnityBridgeElementPair(
  index: number,
  role: string,
  label: string,
  id: string,
  selectable: boolean,
  generation: number,
  rectangle: ComputerUnityBridgeRectangleResult,
  geometry: ComputerUnityBridgeGeometry,
): ComputerUnityBridgeElementPairResult {
  if (rectangle.kind === "rectangle-absent") {
    return { kind: "pair-absent" }
  }
  const visible = computerUnityBridgeVisibleRectangle(rectangle.rectangle, geometry.client)
  if (visible.kind === "rectangle-absent") {
    return { kind: "pair-absent" }
  }
  return {
    kind: "pair-found",
    pair: computerUnityBridgeElementPairFound(
      index,
      role,
      label,
      id,
      selectable,
      generation,
      visible.rectangle,
      geometry,
    ),
  }
}

function computerUnityBridgeElementPairFound(
  index: number,
  role: string,
  label: string,
  id: string,
  selectable: boolean,
  generation: number,
  visible: ComputerUnityBridgeRectangle,
  geometry: ComputerUnityBridgeGeometry,
): ComputerUnityBridgeElementPair {
  const entry: ComputerUnityBridgeElement = {
    index,
    role,
    label,
    id,
    selectable,
    generation,
    client: visible,
    point: { x: visible.x + visible.width / 2, y: visible.y + visible.height / 2 },
  }
  const element: ComputerElement = {
    index,
    role,
    label,
    bounds: {
      kind: COMPUTER_BOUNDS_KNOWN,
      rectangle: {
        x: geometry.client.x + visible.x,
        y: geometry.client.y + visible.y,
        width: visible.width,
        height: visible.height,
      },
    },
    token: id,
  }
  return { element, entry }
}

export function computerUnityBridgeItemId(id?: string): string {
  if (typeof id === "string") {
    return id
  }
  return COMPUTER_UNITY_BRIDGE_STRING_EMPTY
}
