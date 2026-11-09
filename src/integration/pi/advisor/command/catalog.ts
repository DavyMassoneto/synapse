import { type SessionStartEvent } from "@earendil-works/pi-coding-agent"
import { type AutocompleteItem } from "@earendil-works/pi-tui"
import { type AdvisorContext } from "../contracts"
import { COMPLETION_LIMIT, DISABLE_COMMAND, THINKING_COMMAND } from "./constants"
import { modelReferences } from "./references"

export class ModelCatalog {
  private models: string[] = []

  refresh(_event: SessionStartEvent, context: AdvisorContext): void {
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
