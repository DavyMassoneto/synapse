import { type ComputerElement, type ComputerWindowTitle } from "#synapse/modules/computer-use/public/contracts"

export interface ComputerReadTree {
  kind: "tree-read"
  elements: ComputerElement[]
  windowTitle: ComputerWindowTitle
}
