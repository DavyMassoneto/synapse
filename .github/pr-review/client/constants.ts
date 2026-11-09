export const CHAT_PATH = "/chat/completions"
export const USER_AGENT = "synapse-pr-review"
export const AUTH_PREFIX = "Bearer "
export const HEADER_AUTHORIZATION = "authorization"
export const HEADER_CONTENT_TYPE = "content-type"
export const HEADER_USER_AGENT = "user-agent"
export const CONTENT_TYPE_JSON = "application/json"
export const METHOD_POST = "POST"
export const ROLE_SYSTEM = "system"
export const ROLE_USER = "user"
export const MAX_TOKENS = 64_000
export const REASONING_EFFORT = "medium"
export const TEMPERATURE = 0
export const STREAM_ENABLED = true
export const TIMEOUT_MS = 1_800_000
export const SSE_DATA_PREFIX = "data:"
export const SSE_DONE = "[DONE]"
export const STREAM_ENCODING = "utf-8"
export const MAX_ATTEMPTS = 3
export const BACKOFF_MS = 5_000
export const STATUS_TOO_MANY_REQUESTS = 429
export const STATUS_SERVER_ERROR = 500
export const STATUS_BAD_GATEWAY = 502
export const STATUS_UNAVAILABLE = 503
export const STATUS_GATEWAY_TIMEOUT = 504
export const STATUS_ORIGIN_TIMEOUT = 524
export const RETRY_STATUSES = [
  STATUS_TOO_MANY_REQUESTS,
  STATUS_SERVER_ERROR,
  STATUS_BAD_GATEWAY,
  STATUS_UNAVAILABLE,
  STATUS_GATEWAY_TIMEOUT,
  STATUS_ORIGIN_TIMEOUT,
]
export const TRANSIENT_ERROR_NAMES = ["TimeoutError", "AbortError"]
export const ERROR_EMPTY = "resposta vazia"
export const ERROR_EMPTY_STREAM = "resposta vazia; início do fluxo: {}"
export const STREAM_HEAD_CHARS = 400
export const ERROR_HTTP = "HTTP {}"
