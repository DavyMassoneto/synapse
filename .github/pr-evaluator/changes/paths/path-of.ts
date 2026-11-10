import { decodePath } from "./decode-path"

export function pathOf(header: string, prefix: string): string {
  const name = decodePath(header)
  if (name.startsWith(prefix)) {
    return name.slice(prefix.length)
  }
  return name
}
