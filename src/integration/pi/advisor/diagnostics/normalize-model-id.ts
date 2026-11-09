export function normalizeModelId(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-")
}
