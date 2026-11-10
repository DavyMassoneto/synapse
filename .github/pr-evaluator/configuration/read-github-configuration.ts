import { ENV_BASE_SHA, ENV_GITHUB_TOKEN, ENV_HEAD_SHA, ENV_REPOSITORY } from "./constants"
import { requireEnv, requireSha } from "./environment"
import { readPullNumber } from "./read-pull-number"
import { type GithubConfiguration } from "./types"

export function readGithubConfiguration(): GithubConfiguration {
  return {
    token: requireEnv(ENV_GITHUB_TOKEN),
    repository: requireEnv(ENV_REPOSITORY),
    pullNumber: readPullNumber(),
    baseSha: requireSha(ENV_BASE_SHA),
    headSha: requireSha(ENV_HEAD_SHA),
  }
}
