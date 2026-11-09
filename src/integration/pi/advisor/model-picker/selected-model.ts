import { CANCELLED_SELECTION } from "./constants"
import { type MenuChoice, type ModelSelection } from "./types"

export function selectedModel(choice: MenuChoice, options: string[]): ModelSelection {
  if (typeof choice === "string" && options.includes(choice)) {
    return { kind: "selected", model: choice }
  }
  return CANCELLED_SELECTION
}
