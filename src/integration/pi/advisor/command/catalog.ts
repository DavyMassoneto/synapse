import { type AutocompleteItem } from "@earendil-works/pi-tui"
import { type AdvisorContext } from "../host"
import { modelReferences } from "../model-picker"
import { COMPLETION_LIMIT, DISABLE_COMMAND, THINKING_COMMAND } from "./constants"

export class CompletionCatalog {
  private values = [DISABLE_COMMAND, THINKING_COMMAND]

  refresh(context: AdvisorContext): void {
    this.values = [DISABLE_COMMAND, THINKING_COMMAND, ...modelReferences(context)]
  }

  completions(prefix: string): AutocompleteItem[] {
    const normalized = prefix.toLowerCase()
    const items: AutocompleteItem[] = []
    for (const value of this.values) {
      if (items.length === COMPLETION_LIMIT) {
        break
      }
      if (value.toLowerCase().startsWith(normalized)) {
        items.push({ value, label: value })
      }
    }
    return items
  }
}
