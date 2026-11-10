export function removePrefix(name: string, prefix: string): string {
  if (name.startsWith(prefix)) {
    return name.slice(prefix.length)
  }
  return name
}
