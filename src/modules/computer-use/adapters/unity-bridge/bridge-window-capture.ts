import { type ComputerUnityBridgeConfiguration } from "#synapse/modules/computer-use/public/contracts"
import {
  type ComputerUnityBridgeCapture,
  type ComputerUnityBridgeCapturedWindow,
  type ComputerUnityBridgeTreeResult,
} from "./action"
import { ComputerUnityBridgeConnection } from "./bridge-connection"
import { computerUnityBridgeTreeElements } from "./bridge-elements"
import { computerUnityBridgeTreeParse, computerUnityBridgeTreeRequest } from "./bridge-tree"
import {
  COMPUTER_UNITY_BRIDGE_STRING_EMPTY,
  COMPUTER_UNITY_BRIDGE_TREE_MAX_TEXTS,
  COMPUTER_UNITY_BRIDGE_TREE_TIMEOUT_MILLISECONDS,
} from "./constants"
import { computerDiscoverUnityBridge } from "./discovery"
import { type ComputerUnityBridgeReady } from "./handshake"
import { type ComputerUnityBridgeSize, type ComputerUnityBridgeTarget } from "./types"

export async function computerUnityBridgeCapturedWindow(
  configuration: ComputerUnityBridgeConfiguration,
  target: ComputerUnityBridgeTarget,
  image: ComputerUnityBridgeSize,
  room: number,
  offset: number,
): Promise<ComputerUnityBridgeCapturedWindow> {
  const discovery = await computerDiscoverUnityBridge(configuration, target)
  const capture: ComputerUnityBridgeCapture = { target, image, elements: [], generation: 0 }
  if (discovery.kind !== "bridge-ready") {
    return { capture, elements: [] }
  }
  const withFacts: ComputerUnityBridgeCapture = { ...capture, facts: discovery.facts }
  if (!discovery.facts.capabilities.tree || room <= 0) {
    return { capture: withFacts, elements: [] }
  }
  const tree = await computerUnityBridgeCaptureTree(discovery, room)
  if (tree.kind === "tree-invalid") {
    return { capture: withFacts, elements: [] }
  }
  const merged = computerUnityBridgeTreeElements(
    tree.record,
    discovery.facts.geometry,
    offset,
    room,
    COMPUTER_UNITY_BRIDGE_TREE_MAX_TEXTS,
  )
  return {
    capture: { ...withFacts, elements: merged.entries, generation: merged.generation },
    elements: merged.elements,
  }
}

async function computerUnityBridgeCaptureTree(
  ready: ComputerUnityBridgeReady,
  room: number,
): Promise<ComputerUnityBridgeTreeResult> {
  const request = computerUnityBridgeTreeRequest(ready.token, room, COMPUTER_UNITY_BRIDGE_TREE_MAX_TEXTS)
  const connection = new ComputerUnityBridgeConnection(
    ready.port,
    request,
    COMPUTER_UNITY_BRIDGE_TREE_TIMEOUT_MILLISECONDS,
  )
  const response = await connection.transact()
  if (response.kind !== "transport-response") {
    return { kind: "tree-invalid", message: COMPUTER_UNITY_BRIDGE_STRING_EMPTY }
  }
  return computerUnityBridgeTreeParse(response.body)
}
