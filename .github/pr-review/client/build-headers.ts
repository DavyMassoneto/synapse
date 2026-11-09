import { type Settings } from "../settings"
import {
  AUTH_PREFIX,
  CONTENT_TYPE_JSON,
  HEADER_AUTHORIZATION,
  HEADER_CONTENT_TYPE,
  HEADER_USER_AGENT,
  USER_AGENT,
} from "./constants"

export function buildHeaders(settings: Settings): Headers {
  const headers = new Headers()
  headers.set(HEADER_AUTHORIZATION, AUTH_PREFIX + settings.apiKey)
  headers.set(HEADER_CONTENT_TYPE, CONTENT_TYPE_JSON)
  headers.set(HEADER_USER_AGENT, USER_AGENT)
  return headers
}
