import { ParseError, Value } from "typebox/value"
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
  INVALID_FIELD_SEPARATOR,
  INVALID_SETTINGS,
  MISSING_ENV,
  SETTINGS_FIELDS,
} from "./constants"
import { SettingsSchema } from "./schemas"
import { type Settings } from "./types"

export function loadSettings(): Settings {
  const settings = {
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
  try {
    return Value.Parse(SettingsSchema, settings)
  } catch (error) {
    if (!(error instanceof ParseError)) {
      throw error
    }
    const fields = error.cause.errors.map((failure) => SETTINGS_FIELDS.get(failure.instancePath))
    throw new Error(INVALID_SETTINGS + fields.join(INVALID_FIELD_SEPARATOR), { cause: error })
  }
}

export function readEnv(name: string): string {
  const value = process.env[name]
  if (typeof value !== "string") {
    throw new Error(MISSING_ENV + name)
  }
  return value
}
