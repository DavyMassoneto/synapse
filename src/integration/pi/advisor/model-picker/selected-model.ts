import { CANCELLED_SELECTION } from "./constants"
import { type MenuChoice, type ModelSelection } from "./types"

export function selectedModel(choice: MenuChoice): ModelSelection {
  if (typeof choice === "string") {
    return { kind: "selected", model: choice }
  }
  return CANCELLED_SELECTION
}
