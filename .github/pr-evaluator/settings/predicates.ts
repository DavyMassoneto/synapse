import { COMMIT_SHA_PATTERN } from "./constants"

export function isCommitSha(value: string): boolean {
  return COMMIT_SHA_PATTERN.test(value)
}
