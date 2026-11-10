import { fuzzyFilter } from "@earendil-works/pi-tui"

export function searchModels(models: string[], input: string): string[] {
  const normalized = input.toLowerCase()
  const exact = models.filter((model) => model.toLowerCase() === normalized)
  if (exact.length > 0) {
    return exact
  }
  return fuzzyFilter(models, input, (model) => model)
}
