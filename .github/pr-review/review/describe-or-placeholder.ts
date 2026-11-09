export function describeOrPlaceholder(text: string, placeholder: string): string {
  if (text.trim().length === 0) {
    return placeholder
  }
  return text.trim()
}
