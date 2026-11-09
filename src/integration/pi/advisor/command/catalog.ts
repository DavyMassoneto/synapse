import { type AutocompleteItem } from "@earendil-works/pi-tui"
import { type AdvisorContext } from "../host"
import { modelReferences } from "../model-picker"
import { COMPLETION_LIMIT, DISABLE_COMMAND, THINKING_COMMAND } from "./constants"

export class ModelCatalog {
  private models: string[] = []

  refresh(context: AdvisorContext): void {
    this.models = modelReferences(context)
  }

  completions(prefix: string): AutocompleteItem[] {
    const normalized = prefix.toLowerCase()
    const items: AutocompleteItem[] = []
    for (const value of [DISABLE_COMMAND, THINKING_COMMAND, ...this.models]) {
      if (value.toLowerCase().startsWith(normalized)) {
        items.push({ value, label: value })
      }
      if (items.length === COMPLETION_LIMIT) {
        break
      }
    }
    return items
  }
}
