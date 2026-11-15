import {
  type ComputerUnityBridgeActionRecord,
  type ComputerUnityBridgeClickRecord,
  type ComputerUnityBridgeCommandResult,
  type ComputerUnityBridgeGeometryRecord,
  type ComputerUnityBridgeSize,
  type ComputerUnityBridgeTreeRecord,
} from "#synapse/modules/computer-use/adapters/unity-bridge"
import { type ComputerDriverArguments } from "#synapse/modules/computer-use/public/contracts"

export interface ComputerUnityBridgeTestServerOptions {
  pid: number
  instance: string
  screen: ComputerUnityBridgeSize
  geometry: ComputerUnityBridgeGeometryRecord
  click: ComputerUnityBridgeClickRecord
  clickDrop: boolean
  protocol: number
  generation: number
  tree: ComputerUnityBridgeTreeRecord
  action: ComputerUnityBridgeActionRecord
}

export interface ComputerUnityBridgeTestDriverCall {
  name: string
  argumentsValue: ComputerDriverArguments
}

export interface ComputerUnityBridgeTestHandshakeInput {
  port: number
  instance: string
  token: string
  geometry: ComputerUnityBridgeGeometryRecord
  screen: ComputerUnityBridgeSize
  protocol: number
}

export interface ComputerUnityBridgeTestHarnessOptions {
  image: ComputerUnityBridgeSize
  click: ComputerUnityBridgeClickRecord
  clickDrop: boolean
  protocol: number
  generation: number
  tree: ComputerUnityBridgeTreeRecord
  action: ComputerUnityBridgeActionRecord
  bridge: boolean
  unityProbe: boolean
  attachCommand: boolean
  commands: ComputerUnityBridgeCommandResult[]
  clientY: number
}

export interface ComputerUnityBridgeTestPoint {
  x: number
  y: number
}
