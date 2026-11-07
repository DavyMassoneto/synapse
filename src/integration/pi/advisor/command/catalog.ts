import type { AutocompleteItem } from "@earendil-works/pi-tui";
import type { AdvisorContext } from "../contracts";
import { COMPLETION_LIMIT } from "./limits.ts";

export class ModelCatalog {
  private models: string[] = [];

  refresh(context: AdvisorContext): void {
    this.models = this.references(context);
  }

  private references(context: AdvisorContext): string[] {
    const references: string[] = [];
    if (context.scopedModels.length > 0) {
      for (const entry of context.scopedModels) {
        references.push(`${entry.model.provider}/${entry.model.id}`);
      }
      return references;
    }
    for (const model of context.modelRegistry.getAvailable()) {
      references.push(`${model.provider}/${model.id}`);
    }
    return references;
  }

  list(): string[] {
    return [...this.models];
  }

  completions(prefix: string): AutocompleteItem[] {
    const normalized = prefix.toLowerCase();
    const items: AutocompleteItem[] = [];
    for (const value of ["off", "thinking", ...this.models]) {
      if (value.toLowerCase().startsWith(normalized)) {
        items.push({ value, label: value });
      }
      if (items.length === COMPLETION_LIMIT) {
        break;
      }
    }
    return items;
  }

  private matchesTerms(model: string, terms: string[]): boolean {
    for (const term of terms) {
      if (!model.includes(term)) {
        return false;
      }
    }
    return true;
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
      if (this.matchesTerms(normalized, terms)) {
        matches.push(model);
      }
    }
    return matches;
  }
}
