import { Type } from "typebox"

export const API_URL = "https://api.github.com"

export const API_VERSION = "2022-11-28"

export const PullSchema = Type.Object({ head: Type.Object({ sha: Type.String() }) })

export const ReviewListSchema = Type.Array(
  Type.Object({
    body: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    user: Type.Optional(Type.Union([Type.Object({ login: Type.String() }), Type.Null()])),
  }),
)

export const PublishedReviewSchema = Type.Object({ id: Type.Integer(), html_url: Type.String() })

export const BOT_LOGIN = "github-actions[bot]"

export const PER_PAGE = 100

export const MAX_PAGES = 30

export const REQUEST_ATTEMPTS = 3

export const RATE_LIMIT_STATUS = 429

export const FORBIDDEN_STATUS = 403

export const DEFAULT_RETRY_SECONDS = 60

export const MILLISECONDS_PER_SECOND = 1000

export const ERROR_BODY_CHARACTERS = 500
