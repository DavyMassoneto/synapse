import { type Static } from "typebox"
import { type ComputerUnityBridgeCommand } from "#synapse/modules/computer-use/public/contracts"
import {
  type COMPUTER_UNITY_BRIDGE_GEOMETRY_SCHEMA,
  type COMPUTER_UNITY_BRIDGE_HANDSHAKE_SCHEMA,
  type COMPUTER_UNITY_BRIDGE_PING_SCHEMA,
  type COMPUTER_UNITY_BRIDGE_RECTANGLE_SCHEMA,
} from "./schemas"

export type ComputerUnityBridgeHandshakeRecord = Static<typeof COMPUTER_UNITY_BRIDGE_HANDSHAKE_SCHEMA>

export type ComputerUnityBridgePingRecord = Static<typeof COMPUTER_UNITY_BRIDGE_PING_SCHEMA>

export type ComputerUnityBridgeGeometryRecord = Static<typeof COMPUTER_UNITY_BRIDGE_GEOMETRY_SCHEMA>

export type ComputerUnityBridgeRectangleRecord = Static<typeof COMPUTER_UNITY_BRIDGE_RECTANGLE_SCHEMA>

export interface ComputerUnityBridgeRectangle {
  x: number
  y: number
  width: number
  height: number
}
export interface ComputerUnityBridgeSize {
  width: number
  height: number
}
export interface ComputerUnityBridgeGeometry {
  window: ComputerUnityBridgeRectangle
  client: ComputerUnityBridgeRectangle
  captionOffset: number
  windowClass: string
  hwnd: number
}
export interface ComputerUnityBridgeTarget {
  pid: number
  windowId: number
}
export interface ComputerUnityBridgeTargetLookup {
  target?: ComputerUnityBridgeTarget
}
export interface ComputerUnityBridgeTransportResponse {
  kind: "transport-response"
  body: string
}
export interface ComputerUnityBridgeTransportTimeout {
  kind: "transport-timeout"
}
export interface ComputerUnityBridgeTransportFailure {
  kind: "transport-failure"
  message: string
}
export type ComputerUnityBridgeTransportResult =
  | ComputerUnityBridgeTransportResponse
  | ComputerUnityBridgeTransportTimeout
  | ComputerUnityBridgeTransportFailure
export type ComputerUnityBridgeSettlement = (result: ComputerUnityBridgeTransportResult) => void
export interface ComputerUnityBridgeCommandSucceeded {
  kind: "command-succeeded"
}
export interface ComputerUnityBridgeCommandExited {
  kind: "command-exited"
  exitCode: number
  detail: string
}
export interface ComputerUnityBridgeCommandUnavailable {
  kind: "command-unavailable"
  detail: string
}
export type ComputerUnityBridgeCommandResult =
  | ComputerUnityBridgeCommandSucceeded
  | ComputerUnityBridgeCommandExited
  | ComputerUnityBridgeCommandUnavailable
export type ComputerUnityBridgeCommandRunner = (
  command: ComputerUnityBridgeCommand,
  target: ComputerUnityBridgeTarget,
  signal?: AbortSignal,
) => Promise<ComputerUnityBridgeCommandResult>
export type ComputerUnityBridgeProbe = "probe-unity" | "probe-not-unity" | "probe-unknown"
export type ComputerUnityBridgeAttachKind =
  | "attach-attempted"
  | "attach-failed"
  | "attach-not-unity"
  | "attach-unconfigured"
  | "attach-unity-without-command"
  | "attach-indeterminate"
export interface ComputerUnityBridgeAttachResult {
  kind: ComputerUnityBridgeAttachKind
  detail?: string
}
