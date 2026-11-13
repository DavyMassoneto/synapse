export const GET_METHOD = "GET"
export const POST_METHOD = "POST"
export const TRANSPORT_RETRY_DELAY_MS = 1000
export const TRANSPORT_FAILURE_PREFIX = "Falha de transporte do GitHub: "
export const TRANSPORT_RETRY_LABEL = "Repetindo consulta após falha de transporte: "

export const API_URL = "https://api.github.com"

export const API_VERSION = "2022-11-28"

export const REQUEST_ATTEMPTS = 3

export const RATE_LIMIT_STATUS = 429

export const FORBIDDEN_STATUS = 403

export const DEFAULT_RETRY_SECONDS = 60

export const MAX_RETRY_SECONDS = 600

export const REQUEST_TIMEOUT_MS = 60_000

export const MILLISECONDS_PER_SECOND = 1000

export const NO_REMAINING = "0"

export const RETRY_AFTER_HEADER = "retry-after"

export const REMAINING_HEADER = "x-ratelimit-remaining"
