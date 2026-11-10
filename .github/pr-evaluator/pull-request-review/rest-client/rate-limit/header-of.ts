export function headerOf(response: Response, name: string): string {
  const value = response.headers.get(name)
  if (typeof value === "string") {
    return value
  }
  return ""
}
