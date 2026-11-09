import { ENV_BASE_SHA, ENV_GITHUB_TOKEN, ENV_HEAD_SHA, ENV_PULL_NUMBER, ENV_REPOSITORY } from "./constants"
import { requireEnv, requireSha } from "./environment"
import { type GithubConfiguration } from "./types"

export function readGithubConfiguration(): GithubConfiguration {
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
