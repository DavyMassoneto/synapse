export const COMPUTER_DRIVER_RELEASE_API_URL = "https://api.github.com/repos/trycua/cua/releases"

export const COMPUTER_DRIVER_RELEASE_ASSET_BASE_URL = "https://github.com/trycua/cua/releases/download"

export const COMPUTER_DRIVER_RELEASE_RESOLVED = "release-resolved"

export const COMPUTER_DRIVER_RELEASE_FAILED = "release-failed"

export const COMPUTER_DRIVER_RELEASE_RESPONSE = "release-response"

export const COMPUTER_DRIVER_RELEASE_TEXT_READ = "release-text-read"

export const COMPUTER_DRIVER_RELEASE_JSON_READ = "release-json-read"

export const COMPUTER_DRIVER_RELEASE_JSON_ABSENT = "release-json-absent"

export const COMPUTER_DRIVER_RELEASE_TAG_REFS_READ = "release-tag-refs-read"

export const COMPUTER_DRIVER_RELEASE_RELEASE_DETAIL_READ = "release-detail-read"

export const COMPUTER_DRIVER_RELEASE_RELEASE_DETAIL_ABSENT = "release-detail-absent"

export const COMPUTER_DRIVER_RELEASE_TAGS_SELECTED = "release-tags-selected"

export const COMPUTER_DRIVER_RELEASE_CANDIDATE_SKIPPED = "release-candidate-skipped"

export const COMPUTER_DRIVER_RELEASE_HTTP_METHOD = "GET"

export const COMPUTER_DRIVER_RELEASE_ACCEPT_HEADER_NAME = "accept"

export const COMPUTER_DRIVER_RELEASE_ACCEPT_HEADER = "application/vnd.github+json"

export const COMPUTER_DRIVER_RELEASE_ETAG_HEADER_NAME = "etag"

export const COMPUTER_DRIVER_RELEASE_IF_NONE_MATCH_HEADER_NAME = "if-none-match"

export const COMPUTER_DRIVER_RELEASE_TIMEOUT_MILLISECONDS = 15000

export const COMPUTER_DRIVER_RELEASE_HTTP_FORBIDDEN = 403

export const COMPUTER_DRIVER_RELEASE_HTTP_NOT_FOUND = 404

export const COMPUTER_DRIVER_RELEASE_HTTP_NOT_MODIFIED = 304

export const COMPUTER_DRIVER_RELEASE_HTTP_TOO_MANY_REQUESTS = 429

export const COMPUTER_DRIVER_RELEASE_RATE_LIMIT_REMAINING_HEADER_NAME = "x-ratelimit-remaining"

export const COMPUTER_DRIVER_RELEASE_RATE_LIMIT_EXHAUSTED = "0"

export const COMPUTER_DRIVER_RELEASE_TAG_REF_PREFIX = "refs/tags/"

export const COMPUTER_DRIVER_RELEASE_TAG_PREFIX = "cua-driver-rs-v"

export const COMPUTER_DRIVER_RELEASE_TAG_REFS_PATH = "git/matching-refs/tags/"

export const COMPUTER_DRIVER_RELEASE_MAX_TAG_REFS_BYTES = 4194304

export const COMPUTER_DRIVER_RELEASE_MAX_RELEASE_BYTES = 4194304

export const COMPUTER_DRIVER_RELEASE_QUERY_FAILED = "Não foi possível consultar as releases do cua-driver."

export const COMPUTER_DRIVER_RELEASE_RATE_LIMITED =
  "A consulta às releases do cua-driver atingiu o limite de requisições do GitHub; tente novamente mais tarde."

export const COMPUTER_DRIVER_RELEASE_RESPONSE_TOO_LARGE =
  "A resposta da API de releases do cua-driver excede o limite de"

export const COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE =
  "A API de releases do cua-driver devolveu uma resposta inválida."

export const COMPUTER_DRIVER_RELEASE_MISSING_CACHED_PAGE =
  "A API de releases respondeu sem modificação sem uma página em cache correspondente."
