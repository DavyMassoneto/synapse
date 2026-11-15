import {
  type ComputerUnityBridgeGeometry,
  type ComputerUnityBridgeHandshakeRecord,
  type ComputerUnityBridgePingRecord,
  type ComputerUnityBridgeSize,
} from "../types"

export interface ComputerUnityBridgeCapabilities {
  tree: boolean
  hit: boolean
  click: boolean
  key: boolean
  text: boolean
  scroll: boolean
  drag: boolean
  ids: boolean
  texts: boolean
  generation: boolean
}
export interface ComputerUnityBridgeFacts {
  protocol: number
  instance: string
  screen: ComputerUnityBridgeSize
  geometry: ComputerUnityBridgeGeometry
  capabilities: ComputerUnityBridgeCapabilities
  generation: number
}
export interface ComputerUnityBridgeHandshakeRead {
  kind: "handshake-read"
  record: ComputerUnityBridgeHandshakeRecord
}
export interface ComputerUnityBridgeHandshakeAbsent {
  kind: "handshake-absent"
}
export interface ComputerUnityBridgeHandshakeUnread {
  kind: "handshake-unread"
  detail: string
}
export type ComputerUnityBridgeHandshakeResult =
  | ComputerUnityBridgeHandshakeRead
  | ComputerUnityBridgeHandshakeAbsent
  | ComputerUnityBridgeHandshakeUnread
export interface ComputerUnityBridgeHandshakeValid {
  kind: "handshake-valid"
}
export interface ComputerUnityBridgeHandshakeInvalid {
  kind: "handshake-invalid"
  reason: string
}
export type ComputerUnityBridgeValidation = ComputerUnityBridgeHandshakeValid | ComputerUnityBridgeHandshakeInvalid
export interface ComputerUnityBridgeHandshakeValidated {
  kind: "handshake-validated"
  record: ComputerUnityBridgeHandshakeRecord
}
export type ComputerUnityBridgeValidatedHandshake = ComputerUnityBridgeHandshakeValidated | ComputerUnityBridgeRejected
export interface ComputerUnityBridgeFactsValid {
  kind: "facts-valid"
  facts: ComputerUnityBridgeFacts
}
export interface ComputerUnityBridgeFactsInvalid {
  kind: "facts-invalid"
  reason: string
}
export type ComputerUnityBridgeFactsResult = ComputerUnityBridgeFactsValid | ComputerUnityBridgeFactsInvalid
export interface ComputerUnityBridgePingParsed {
  kind: "ping-parsed"
  record: ComputerUnityBridgePingRecord
}
export type ComputerUnityBridgePingParse = ComputerUnityBridgePingParsed | ComputerUnityBridgeFactsInvalid
export interface ComputerUnityBridgeReady {
  kind: "bridge-ready"
  port: number
  token: string
  facts: ComputerUnityBridgeFacts
}
export interface ComputerUnityBridgeRejected {
  kind: "bridge-rejected"
  reason: string
}
export type ComputerUnityBridgeDiscovery = ComputerUnityBridgeReady | ComputerUnityBridgeRejected
