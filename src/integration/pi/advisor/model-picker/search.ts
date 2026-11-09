import { fuzzyFilter } from "@earendil-works/pi-tui"

export function searchModels(models: string[], input: string): string[] {
  const exact = models.filter((model) => model.toLowerCase() === input.toLowerCase())
  if (exact.length > 0) {
    return exact
  }
  return fuzzyFilter(models, input, (model) => model)
}
