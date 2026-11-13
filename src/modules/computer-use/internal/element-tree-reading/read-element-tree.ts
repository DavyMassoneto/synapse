import {
  COMPUTER_BOUNDS_ABSENT,
  COMPUTER_TITLE_ABSENT,
  COMPUTER_TITLE_PRESENT,
  type ComputerElement,
  type ComputerWindowTitle,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_AX_ELEMENT_LINE,
  COMPUTER_AX_LABEL_GROUPS,
  COMPUTER_AX_WINDOW_TITLE,
  COMPUTER_TREE_READ,
} from "./constants"
import { type ComputerReadTree } from "./types"

function computerReadAxLabel(match: RegExpExecArray): string {
  for (const group of COMPUTER_AX_LABEL_GROUPS) {
    const label = match[group]
    if (label) {
      return label
    }
  }
  return ""
}

function computerReadAxTitle(tree: string): ComputerWindowTitle {
  const match = COMPUTER_AX_WINDOW_TITLE.exec(tree)
  if (match?.[1]) {
    return { kind: COMPUTER_TITLE_PRESENT, title: match[1] }
  }
  return { kind: COMPUTER_TITLE_ABSENT }
}

export function computerReadElementTree(text: string): ComputerReadTree {
  const elements: ComputerElement[] = []
  for (const match of text.matchAll(COMPUTER_AX_ELEMENT_LINE)) {
    const index = Number(match[1])
    const role = match[2]
    if (Number.isSafeInteger(index) && index > 0 && role) {
      elements.push({ index, role, label: computerReadAxLabel(match), bounds: { kind: COMPUTER_BOUNDS_ABSENT } })
    }
  }
  return { kind: COMPUTER_TREE_READ, elements, windowTitle: computerReadAxTitle(text) }
}
