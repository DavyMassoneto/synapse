import {
  COMMIT_SHA_PATTERN,
  ENV_BASE_SHA,
  ENV_GITHUB_TOKEN,
  ENV_HEAD_SHA,
  ENV_MODEL_KEY,
  ENV_MODEL_NAME,
  ENV_MODEL_URL,
  ENV_PULL_NUMBER,
  ENV_REPOSITORY,
  PULL_NUMBER_PATTERN,
} from "./constants"
import { type Configuration } from "./types"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (value) {
    return value
  }
  throw new Error(`Variável de ambiente ausente: ${name}`)
}

function requireSha(name: string): string {
  const value = requireEnv(name)
  if (COMMIT_SHA_PATTERN.test(value)) {
    return value
  }
  throw new Error(`${name} não é um SHA de commit completo`)
}

function requirePullNumber(): number {
  const value = requireEnv(ENV_PULL_NUMBER)
  const pullNumber = Number(value)
  if (PULL_NUMBER_PATTERN.test(value) && Number.isSafeInteger(pullNumber)) {
    return pullNumber
  }
  throw new Error(`${ENV_PULL_NUMBER} não é um número de PR`)
}

export function readConfiguration(): Configuration {
  return {
    root: process.cwd(),
    github: {
      token: requireEnv(ENV_GITHUB_TOKEN),
      repository: requireEnv(ENV_REPOSITORY),
      pullNumber: requirePullNumber(),
      baseSha: requireSha(ENV_BASE_SHA),
      headSha: requireSha(ENV_HEAD_SHA),
    },
    model: {
      apiKey: requireEnv(ENV_MODEL_KEY),
      baseUrl: requireEnv(ENV_MODEL_URL),
      model: requireEnv(ENV_MODEL_NAME),
    },
  }
}
