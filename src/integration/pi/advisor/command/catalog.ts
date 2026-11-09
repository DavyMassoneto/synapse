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
    return [DISABLE_COMMAND, THINKING_COMMAND, ...this.models]
      .filter((value) => value.toLowerCase().startsWith(normalized))
      .slice(0, COMPLETION_LIMIT)
      .map((value) => ({ value, label: value }))
  }
}
