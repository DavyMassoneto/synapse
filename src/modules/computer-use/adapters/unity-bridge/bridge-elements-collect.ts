import { type ComputerElement } from "#synapse/modules/computer-use/public/contracts"
import { type ComputerUnityBridgeElement, type ComputerUnityBridgeTreeRecord } from "./action"
import {
  computerUnityBridgeClientRectangle,
  computerUnityBridgeElementPair,
  computerUnityBridgeItemId,
} from "./bridge-elements-rectangle"
import { COMPUTER_UNITY_BRIDGE_ELEMENT_ROLE_TEXT } from "./constants"
import { type ComputerUnityBridgeGeometry } from "./types"

export function computerUnityBridgeCollectItems(
  elements: ComputerElement[],
  entries: ComputerUnityBridgeElement[],
  tree: ComputerUnityBridgeTreeRecord,
  geometry: ComputerUnityBridgeGeometry,
  offset: number,
  room: number,
  generation: number,
): void {
  for (const item of tree.items) {
    if (elements.length >= room) {
      break
    }
    let label = item.path
    if (typeof item.label === "string" && item.label.trim()) {
      label = item.label
    }
    const pair = computerUnityBridgeElementPair(
      offset + elements.length,
      item.type,
      label,
      computerUnityBridgeItemId(item.id),
      true,
      generation,
      computerUnityBridgeClientRectangle(item.client_x, item.client_y, item.client_w, item.client_h),
      geometry,
    )
    if (pair.kind === "pair-found") {
      elements.push(pair.pair.element)
      entries.push(pair.pair.entry)
    }
  }
}

export function computerUnityBridgeCollectTexts(
  elements: ComputerElement[],
  entries: ComputerUnityBridgeElement[],
  tree: ComputerUnityBridgeTreeRecord,
  geometry: ComputerUnityBridgeGeometry,
  offset: number,
  room: number,
  maxTexts: number,
  generation: number,
): void {
  const texts = tree.texts
  if (texts && maxTexts > 0) {
    const textRoom = Math.min(room, elements.length + maxTexts)
    for (const text of texts) {
      if (elements.length >= textRoom) {
        break
      }
      if (typeof text.selectable_id === "string") {
        continue
      }
      const pair = computerUnityBridgeElementPair(
        offset + elements.length,
        COMPUTER_UNITY_BRIDGE_ELEMENT_ROLE_TEXT,
        text.text,
        computerUnityBridgeItemId(text.id),
        false,
        generation,
        computerUnityBridgeClientRectangle(text.client_x, text.client_y, text.client_w, text.client_h),
        geometry,
      )
      if (pair.kind === "pair-found") {
        elements.push(pair.pair.element)
        entries.push(pair.pair.entry)
      }
    }
  }
}
