import { type AutocompleteItem } from "@earendil-works/pi-tui";
import { type AdvisorContext } from "@/integration/pi/advisor";

const COMPLETION_LIMIT = 40;

export class ModelCatalog {
  private models: string[] = [];

  refresh(context: AdvisorContext): void {
    this.models = [];
    if (context.scopedModels.length > 0) {
      for (const entry of context.scopedModels) {
        this.models.push(`${entry.model.provider}/${entry.model.id}`);
      }
    } else {
      for (const model of context.modelRegistry.getAvailable()) {
        this.models.push(`${model.provider}/${model.id}`);
      }
    }
  }

  list(): string[] {
    return [...this.models];
  }

  completions(prefix: string): AutocompleteItem[] {
    const normalizedPrefix = prefix.toLowerCase();
    const items: AutocompleteItem[] = [];
    for (const value of ["off", "thinking", ...this.models]) {
      if (value.toLowerCase().startsWith(normalizedPrefix)) {
        items.push({ value, label: value });
      }
      if (items.length === COMPLETION_LIMIT) {
        break;
      }
    }
    return items;
  }

  search(input: string): string[] {
    const search = input.toLowerCase();
    const terms = search.split(/\s+/);
    const matches: string[] = [];
    for (const model of this.models) {
      const normalized = model.toLowerCase();
      if (normalized === search) {
        return [model];
      }
      let matchesAll = true;
      for (const term of terms) {
        if (!normalized.includes(term)) {
          matchesAll = false;
          break;
        }
      }
      if (matchesAll) {
        matches.push(model);
      }
    }
    return matches;
  }
}
