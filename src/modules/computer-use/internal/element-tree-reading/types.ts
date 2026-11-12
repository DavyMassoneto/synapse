import { type ComputerElement, type ComputerWindowTitle } from "#synapse/modules/computer-use/public/contracts"
import { type COMPUTER_TREE_READ, type COMPUTER_TREE_UNSUPPORTED } from "./constants"

export interface ComputerReadTree {
  kind: typeof COMPUTER_TREE_READ
  elements: ComputerElement[]
  windowTitle: ComputerWindowTitle
}

export interface ComputerUnsupportedTree {
  kind: typeof COMPUTER_TREE_UNSUPPORTED
  format: string
}

export type ComputerTreeReadResult = ComputerReadTree | ComputerUnsupportedTree
