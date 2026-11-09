import {
  ENV_BASE_SHA,
  ENV_GITHUB_TOKEN,
  ENV_HEAD_SHA,
  ENV_MODEL_KEY,
  ENV_MODEL_NAME,
  ENV_MODEL_URL,
  ENV_PULL_NUMBER,
  ENV_REPOSITORY,
} from "./constants"
import { isCommitSha } from "./predicates"
import { type GithubSettings, type Settings } from "./types"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (typeof value === "string" && value.length > 0) {
    return value
  }
  throw new Error(`Variável de ambiente ausente: ${name}`)
}

function requireSha(name: string): string {
  const value = requireEnv(name)
  if (isCommitSha(value)) {
    return value
  }
  throw new Error(`${name} não é um SHA de commit completo`)
}

function readGithub(): GithubSettings {
  const pullNumber = Number(requireEnv(ENV_PULL_NUMBER))
  if (!Number.isInteger(pullNumber)) {
    throw new Error(`${ENV_PULL_NUMBER} não é um número inteiro`)
  }
  return {
    token: requireEnv(ENV_GITHUB_TOKEN),
    repository: requireEnv(ENV_REPOSITORY),
    pullNumber,
    baseSha: requireSha(ENV_BASE_SHA),
    headSha: requireSha(ENV_HEAD_SHA),
  }
}

export function readSettings(): Settings {
  return {
    github: readGithub(),
    model: {
      apiKey: requireEnv(ENV_MODEL_KEY),
      baseUrl: requireEnv(ENV_MODEL_URL),
      model: requireEnv(ENV_MODEL_NAME),
    },
  }
}
