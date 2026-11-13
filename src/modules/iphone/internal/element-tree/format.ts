import { type IphoneElement } from "#synapse/modules/iphone/public/contracts"
import {
  IPHONE_TREE_APP_KNOWN,
  IPHONE_TREE_APP_PREFIX,
  IPHONE_TREE_DISABLED_TEXT,
  IPHONE_TREE_ELEMENTS_TEXT,
  IPHONE_TREE_ID_TEXT,
  IPHONE_TREE_TRUNCATED_TEXT,
  IPHONE_TREE_UNKNOWN_APP,
  IPHONE_TREE_VALUE_TEXT,
} from "./constants"
import { type IphoneElementTree } from "./types"

function formatIphoneElement(element: IphoneElement): string {
  const label = element.label ? element.label : element.name
  const text = label ? ` ${JSON.stringify(label)}` : ""
  const value =
    element.value && element.value !== element.label ? `${IPHONE_TREE_VALUE_TEXT}${JSON.stringify(element.value)}` : ""
  const id =
    element.name && element.name !== element.label ? `${IPHONE_TREE_ID_TEXT}${JSON.stringify(element.name)}` : ""
  const disabled = element.enabled ? "" : IPHONE_TREE_DISABLED_TEXT
  const rect = element.rect
  return `[${element.index}] ${element.type}${text}${value}${id} @(${rect.x},${rect.y} ${rect.width}x${rect.height})${disabled}`
}

export function formatIphoneElementTree(tree: IphoneElementTree): string {
  const app = tree.app.kind === IPHONE_TREE_APP_KNOWN ? tree.app.name : IPHONE_TREE_UNKNOWN_APP
  const truncated = tree.truncated ? IPHONE_TREE_TRUNCATED_TEXT : ""
  return `${IPHONE_TREE_APP_PREFIX}${app}\n${tree.elements.length}${IPHONE_TREE_ELEMENTS_TEXT}${truncated}:\n${tree.elements.map(formatIphoneElement).join("\n")}`
}
