import { type ComputerElement } from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_RENDER_MAX_LABEL_CHARS } from "./constants"

export function computerTruncateElement(element: ComputerElement): ComputerElement {
  const truncated = { ...element }
  if (element.label) {
    truncated.label = element.label.slice(0, COMPUTER_RENDER_MAX_LABEL_CHARS)
  }
  return truncated
}
