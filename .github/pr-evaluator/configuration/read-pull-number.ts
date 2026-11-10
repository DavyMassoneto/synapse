import { ENV_PULL_NUMBER } from "./constants"
import { requireEnv } from "./environment"

export function readPullNumber(): number {
  const pullNumber = Number(requireEnv(ENV_PULL_NUMBER))
  if (Number.isInteger(pullNumber)) {
    return pullNumber
  }
  throw new Error(`${ENV_PULL_NUMBER} não é um número inteiro`)
}
