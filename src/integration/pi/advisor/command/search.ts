export function searchModels(models: string[], input: string): string[] {
  const query = input.toLowerCase()
  const terms = query.split(/\s+/)
  const matches: string[] = []
  for (const model of models) {
    const normalized = model.toLowerCase()
    if (normalized === query) {
      return [model]
    }
    let matched = true
    for (const term of terms) {
      if (!normalized.includes(term)) {
        matched = false
        break
      }
    }
    if (matched) {
      matches.push(model)
    }
  }
  return matches
}
