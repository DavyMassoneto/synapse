import { COMMIT_SHA_PATTERN } from "./constants"

export function isCommitSha(value: string): boolean {
  return COMMIT_SHA_PATTERN.test(value)
}

export function hasText(value?: string): value is string {
  return typeof value === "string" && value.length > 0
}
