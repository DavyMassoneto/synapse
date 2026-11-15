import { type ComputerElement } from "#synapse/modules/computer-use/public/contracts"
import {
  type ComputerUnityBridgeElement,
  type ComputerUnityBridgeTreeElements,
  type ComputerUnityBridgeTreeRecord,
} from "./action"
import { computerUnityBridgeCollectItems, computerUnityBridgeCollectTexts } from "./bridge-elements-collect"
import { type ComputerUnityBridgeGeometry } from "./types"

export function computerUnityBridgeTreeElements(
  tree: ComputerUnityBridgeTreeRecord,
  geometry: ComputerUnityBridgeGeometry,
  offset: number,
  room: number,
  maxTexts: number,
): ComputerUnityBridgeTreeElements {
  const elements: ComputerElement[] = []
  const entries: ComputerUnityBridgeElement[] = []
  let generation = 0
  if (typeof tree.generation === "number") {
    generation = tree.generation
  }
  computerUnityBridgeCollectItems(elements, entries, tree, geometry, offset, room, generation)
  computerUnityBridgeCollectTexts(elements, entries, tree, geometry, offset, room, maxTexts, generation)
  return { elements, entries, generation }
}
