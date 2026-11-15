import { type Static } from "typebox"
import { type ComputerElement } from "#synapse/modules/computer-use/public/contracts"
import { type ComputerUnityBridgeFacts } from "../handshake"
import {
  type COMPUTER_UNITY_BRIDGE_ACTION_DESKTOP_SCHEMA,
  type COMPUTER_UNITY_BRIDGE_ACTION_SCHEMA,
  type COMPUTER_UNITY_BRIDGE_TREE_SCHEMA,
} from "../schemas"
import {
  type ComputerUnityBridgeRectangle,
  type ComputerUnityBridgeSize,
  type ComputerUnityBridgeTarget,
} from "../types"

export type ComputerUnityBridgeActionRecord = Static<typeof COMPUTER_UNITY_BRIDGE_ACTION_SCHEMA>

export type ComputerUnityBridgeActionDesktop = Static<typeof COMPUTER_UNITY_BRIDGE_ACTION_DESKTOP_SCHEMA>

export type ComputerUnityBridgeClickRecord = Static<typeof COMPUTER_UNITY_BRIDGE_ACTION_SCHEMA>

export type ComputerUnityBridgeTreeRecord = Static<typeof COMPUTER_UNITY_BRIDGE_TREE_SCHEMA>

export interface ComputerUnityBridgePointer {
  x: number
  y: number
}
export interface ComputerUnityBridgeElement {
  index: number
  role: string
  label: string
  id: string
  selectable: boolean
  generation: number
  client: ComputerUnityBridgeRectangle
  point: ComputerUnityBridgePointer
}
export interface ComputerUnityBridgeCapturedWindow {
  capture: ComputerUnityBridgeCapture
  elements: ComputerElement[]
}
export interface ComputerUnityBridgeCapture {
  target: ComputerUnityBridgeTarget
  image: ComputerUnityBridgeSize
  facts?: ComputerUnityBridgeFacts
  elements: ComputerUnityBridgeElement[]
  generation: number
}
export interface ComputerUnityBridgeMeasurement {
  image?: ComputerUnityBridgeSize
}
export interface ComputerUnityBridgePointMapped {
  kind: "point-mapped"
  clientX: number
  clientY: number
}
export interface ComputerUnityBridgePointRejected {
  kind: "point-rejected"
  message: string
}
export type ComputerUnityBridgePointResult = ComputerUnityBridgePointMapped | ComputerUnityBridgePointRejected
export interface ComputerUnityBridgeRequest {
  op: string
  token: string
  x?: number
  y?: number
  hover?: boolean
  id?: string
  generation?: number
  dx?: number
  dy?: number
  direction?: string
  amount?: number
  from_x?: number
  from_y?: number
  to_x?: number
  to_y?: number
  steps?: number
  text?: string
  submit?: boolean
  replace?: boolean
  key?: string
  max?: number
  max_texts?: number
  include_texts?: boolean
  include_offscreen?: boolean
}
export interface ComputerUnityBridgeTreeParsed {
  kind: "tree-parsed"
  record: ComputerUnityBridgeTreeRecord
}
export interface ComputerUnityBridgeTreeInvalid {
  kind: "tree-invalid"
  message: string
}
export type ComputerUnityBridgeTreeResult = ComputerUnityBridgeTreeParsed | ComputerUnityBridgeTreeInvalid
export interface ComputerUnityBridgeTreeElements {
  elements: ComputerElement[]
  entries: ComputerUnityBridgeElement[]
  generation: number
}
export interface ComputerUnityBridgeElementPair {
  element: ComputerElement
  entry: ComputerUnityBridgeElement
}
export interface ComputerUnityBridgeCaptureValid {
  kind: "capture-check-valid"
  capture: ComputerUnityBridgeCapture
}
export interface ComputerUnityBridgeCaptureRefused {
  kind: "capture-check-refused"
  message: string
}
export type ComputerUnityBridgeCaptureCheck = ComputerUnityBridgeCaptureValid | ComputerUnityBridgeCaptureRefused
export interface ComputerUnityBridgeInputRequest {
  kind: "input-request"
  request: ComputerUnityBridgeRequest
}
export interface ComputerUnityBridgeInputNative {
  kind: "input-native"
}
export interface ComputerUnityBridgeInputRefused {
  kind: "input-refused"
  message: string
}
export type ComputerUnityBridgeInputPlan =
  | ComputerUnityBridgeInputNative
  | ComputerUnityBridgeInputRefused
  | ComputerUnityBridgeInputRequest
export interface ComputerUnityBridgeActionParsed {
  kind: "action-parsed"
  record: ComputerUnityBridgeActionRecord
}
export interface ComputerUnityBridgeActionInvalid {
  kind: "action-invalid"
  message: string
}
export type ComputerUnityBridgeActionResult = ComputerUnityBridgeActionParsed | ComputerUnityBridgeActionInvalid
export interface ComputerUnityBridgeRectangleFound {
  kind: "rectangle-found"
  rectangle: ComputerUnityBridgeRectangle
}
export interface ComputerUnityBridgeRectangleAbsent {
  kind: "rectangle-absent"
}
export type ComputerUnityBridgeRectangleResult = ComputerUnityBridgeRectangleFound | ComputerUnityBridgeRectangleAbsent
export interface ComputerUnityBridgeElementFound {
  kind: "element-found"
  element: ComputerUnityBridgeElement
}
export interface ComputerUnityBridgeElementAbsent {
  kind: "element-absent"
}
export type ComputerUnityBridgeElementLookup = ComputerUnityBridgeElementFound | ComputerUnityBridgeElementAbsent
export interface ComputerUnityBridgeElementPairFound {
  kind: "pair-found"
  pair: ComputerUnityBridgeElementPair
}
export interface ComputerUnityBridgeElementPairAbsent {
  kind: "pair-absent"
}
export type ComputerUnityBridgeElementPairResult =
  | ComputerUnityBridgeElementPairFound
  | ComputerUnityBridgeElementPairAbsent
