import { isIgnored } from "./paths"
import { type OptionalChangedFile } from "./types"

export function isReviewable(file: OptionalChangedFile): boolean {
  return file !== undefined && !isIgnored(file.path)
}
