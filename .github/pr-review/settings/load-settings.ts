import {
  ENV_API_KEY,
  ENV_BASE_SHA,
  ENV_BASE_URL,
  ENV_HEAD_SHA,
  ENV_MODEL,
  ENV_PR_BODY,
  ENV_PR_NUMBER,
  ENV_PR_TITLE,
  ENV_REPO,
  MISSING_ENV,
} from "./constants"
import { type Settings } from "./types"

export function loadSettings(): Settings {
  return {
    repo: readEnv(ENV_REPO),
    prNumber: readEnv(ENV_PR_NUMBER),
    baseSha: readEnv(ENV_BASE_SHA),
    headSha: readEnv(ENV_HEAD_SHA),
    baseUrl: readEnv(ENV_BASE_URL),
    apiKey: readEnv(ENV_API_KEY),
    model: readEnv(ENV_MODEL),
    prTitle: readEnv(ENV_PR_TITLE),
    prBody: readEnv(ENV_PR_BODY),
  }
}

export function readEnv(name: string): string {
  const value = process.env[name]
  if (typeof value !== "string") {
    throw new Error(MISSING_ENV + name)
  }
  return value
}
