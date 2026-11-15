import {
  COMPUTER_DRIVER_RELEASE_FAILED,
  COMPUTER_DRIVER_RELEASE_HTTP_FORBIDDEN,
  COMPUTER_DRIVER_RELEASE_HTTP_NOT_MODIFIED,
  COMPUTER_DRIVER_RELEASE_HTTP_TOO_MANY_REQUESTS,
  COMPUTER_DRIVER_RELEASE_QUERY_FAILED,
  COMPUTER_DRIVER_RELEASE_RATE_LIMIT_EXHAUSTED,
  COMPUTER_DRIVER_RELEASE_RATE_LIMIT_REMAINING_HEADER_NAME,
  COMPUTER_DRIVER_RELEASE_RATE_LIMITED,
} from "../constants"
import { computerFetchDriverRelease, computerReadReleaseResponseText } from "../read-release-response"
import {
  COMPUTER_DRIVER_RELEASE_ACCEPT_HEADER,
  COMPUTER_DRIVER_RELEASE_ACCEPT_HEADER_NAME,
  COMPUTER_DRIVER_RELEASE_ETAG_HEADER_NAME,
  COMPUTER_DRIVER_RELEASE_IF_NONE_MATCH_HEADER_NAME,
  COMPUTER_DRIVER_RELEASE_MAX_PAGE_BYTES,
  COMPUTER_DRIVER_RELEASE_MISSING_CACHED_PAGE,
  COMPUTER_DRIVER_RELEASE_PAGE_READ,
} from "./constants"
import { computerParseDriverReleasePage } from "./parse-release-page"
import {
  type ComputerDriverReleasePageRead,
  type ComputerDriverReleasePageReadResult,
  type ComputerDriverReleasePageRequest,
} from "./types"

export async function computerReadDriverReleasePage(
  request: ComputerDriverReleasePageRequest,
): Promise<ComputerDriverReleasePageReadResult> {
  const headers = new Headers()
  headers.set(COMPUTER_DRIVER_RELEASE_ACCEPT_HEADER_NAME, COMPUTER_DRIVER_RELEASE_ACCEPT_HEADER)
  if (request.cached) {
    headers.set(COMPUTER_DRIVER_RELEASE_IF_NONE_MATCH_HEADER_NAME, request.cached.etag)
  }
  const fetched = await computerFetchDriverRelease({ fetch: request.fetch, url: request.url, headers })
  if (fetched.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return fetched
  }
  if (fetched.response.status === COMPUTER_DRIVER_RELEASE_HTTP_NOT_MODIFIED) {
    return computerRevalidatedReleasePage(request)
  }
  if (!fetched.response.ok) {
    return computerReleasePageFailure(fetched.response)
  }
  return computerFreshReleasePage(fetched.response)
}

function computerRevalidatedReleasePage(
  request: ComputerDriverReleasePageRequest,
): ComputerDriverReleasePageReadResult {
  const cached = request.cached
  if (!cached) {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_MISSING_CACHED_PAGE }
  }
  const parsed = computerParseDriverReleasePage(cached.body)
  if (parsed.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return parsed
  }
  const read: ComputerDriverReleasePageRead = {
    kind: COMPUTER_DRIVER_RELEASE_PAGE_READ,
    releases: parsed.releases,
    body: cached.body,
    etag: cached.etag,
  }
  return read
}

function computerReleasePageFailure(response: Response): ComputerDriverReleasePageReadResult {
  if (
    response.status === COMPUTER_DRIVER_RELEASE_HTTP_TOO_MANY_REQUESTS ||
    (response.status === COMPUTER_DRIVER_RELEASE_HTTP_FORBIDDEN &&
      response.headers.get(COMPUTER_DRIVER_RELEASE_RATE_LIMIT_REMAINING_HEADER_NAME) ===
        COMPUTER_DRIVER_RELEASE_RATE_LIMIT_EXHAUSTED)
  ) {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_RATE_LIMITED }
  }
  return {
    kind: COMPUTER_DRIVER_RELEASE_FAILED,
    message: `${COMPUTER_DRIVER_RELEASE_QUERY_FAILED} HTTP ${response.status}.`,
  }
}

async function computerFreshReleasePage(response: Response): Promise<ComputerDriverReleasePageReadResult> {
  const text = await computerReadReleaseResponseText(response, COMPUTER_DRIVER_RELEASE_MAX_PAGE_BYTES)
  if (text.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return text
  }
  const parsed = computerParseDriverReleasePage(text.text)
  if (parsed.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return parsed
  }
  const read: ComputerDriverReleasePageRead = {
    kind: COMPUTER_DRIVER_RELEASE_PAGE_READ,
    releases: parsed.releases,
    body: text.text,
  }
  const etag = response.headers.get(COMPUTER_DRIVER_RELEASE_ETAG_HEADER_NAME)
  if (etag) {
    read.etag = etag
  }
  return read
}
