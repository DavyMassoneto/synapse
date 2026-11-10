export function placeholderValue(values: Map<string, string>, placeholder: string): string {
  const value = values.get(placeholder)
  if (typeof value === "string") {
    return value
  }
  throw new Error(`Marcador desconhecido no modelo do prompt: ${placeholder}`)
}
