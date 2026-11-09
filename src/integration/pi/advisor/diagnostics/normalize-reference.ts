export function normalizeReference(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-")
}
