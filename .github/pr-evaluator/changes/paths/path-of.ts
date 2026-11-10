import { decodePath } from "./decode-path"
import { removePrefix } from "./remove-prefix"

export function pathOf(header: string, prefix: string): string {
  return removePrefix(decodePath(header), prefix)
}
