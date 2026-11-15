import { type ComputerUnityBridgePointer, type ComputerUnityBridgePointResult } from "./action"
import {
  COMPUTER_UNITY_BRIDGE_GEOMETRY_TEXT,
  COMPUTER_UNITY_BRIDGE_OUTSIDE_TEXT,
  COMPUTER_UNITY_BRIDGE_POINT_END,
  COMPUTER_UNITY_BRIDGE_POINT_SEPARATOR,
} from "./constants"
import {
  hasComputerUnityBridgePointInsideClient,
  hasComputerUnityBridgePointInsideImage,
  isComputerUnityBridgeImageCoveragePlausible,
  isComputerUnityBridgeImageUsable,
} from "./predicates"
import {
  type ComputerUnityBridgeGeometry,
  type ComputerUnityBridgeGeometryRecord,
  type ComputerUnityBridgeRectangle,
  type ComputerUnityBridgeRectangleRecord,
  type ComputerUnityBridgeSize,
} from "./types"

export function computerUnityBridgeRectangle(record: ComputerUnityBridgeRectangleRecord): ComputerUnityBridgeRectangle {
  return { x: record.x, y: record.y, width: record.w, height: record.h }
}

export function computerUnityBridgeGeometry(record: ComputerUnityBridgeGeometryRecord): ComputerUnityBridgeGeometry {
  return {
    window: computerUnityBridgeRectangle(record.window),
    client: computerUnityBridgeRectangle(record.client),
    captionOffset: record.caption_offset,
    windowClass: record.window_class,
    hwnd: record.hwnd,
  }
}

export function computerUnityBridgeClientPoint(
  pointer: ComputerUnityBridgePointer,
  image: ComputerUnityBridgeSize,
  geometry: ComputerUnityBridgeGeometry,
): ComputerUnityBridgePointResult {
  const client = geometry.client
  if (!isComputerUnityBridgeImageUsable(image, client) || !hasComputerUnityBridgePointInsideImage(pointer, image)) {
    return { kind: "point-rejected", message: COMPUTER_UNITY_BRIDGE_GEOMETRY_TEXT }
  }
  const scale = client.width / image.width
  const spanHeight = image.height * scale
  if (!isComputerUnityBridgeImageCoveragePlausible(spanHeight, client.height, geometry.captionOffset)) {
    return { kind: "point-rejected", message: COMPUTER_UNITY_BRIDGE_GEOMETRY_TEXT }
  }
  const clientX = pointer.x * scale
  const clientY = pointer.y * scale + client.height - spanHeight
  if (!hasComputerUnityBridgePointInsideClient(clientX, clientY, client)) {
    return {
      kind: "point-rejected",
      message: `${COMPUTER_UNITY_BRIDGE_OUTSIDE_TEXT}${clientX}${COMPUTER_UNITY_BRIDGE_POINT_SEPARATOR}${clientY}${COMPUTER_UNITY_BRIDGE_POINT_END}`,
    }
  }
  return { kind: "point-mapped", clientX, clientY }
}
