export const ENV_REPO = "REPO"
export const ENV_PR_NUMBER = "PR_NUMBER"
export const ENV_BASE_SHA = "BASE_SHA"
export const ENV_HEAD_SHA = "HEAD_SHA"
export const ENV_BASE_URL = "OMNIROUTE_BASE_URL"
export const ENV_API_KEY = "OMNIROUTE_API_KEY"
export const ENV_MODEL = "REVIEW_MODEL"
export const ENV_PR_TITLE = "PR_TITLE"
export const ENV_PR_BODY = "PR_BODY"
export const INVALID_SETTINGS = "Configuração inválida: "
export const SETTINGS_FIELDS: ReadonlyMap<string, string> = new Map([
  ["/prNumber", ENV_PR_NUMBER],
  ["/baseSha", ENV_BASE_SHA],
  ["/headSha", ENV_HEAD_SHA],
])
export const INVALID_FIELD_SEPARATOR = ", "
export const MISSING_ENV = "Variável de ambiente ausente: "
