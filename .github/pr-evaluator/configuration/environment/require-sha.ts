import { isCommitSha } from "./predicates"
import { requireEnv } from "./require-env"

export function requireSha(name: string): string {
  const value = requireEnv(name)
  if (isCommitSha(value)) {
    return value
  }
  throw new Error(`${name} não é um SHA de commit completo`)
}
