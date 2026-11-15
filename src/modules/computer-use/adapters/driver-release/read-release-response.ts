import { type ComputerDriverReleaseFailed } from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_DRIVER_RELEASE_ACCEPT_HEADER,
  COMPUTER_DRIVER_RELEASE_ACCEPT_HEADER_NAME,
  COMPUTER_DRIVER_RELEASE_ETAG_HEADER_NAME,
  COMPUTER_DRIVER_RELEASE_FAILED,
  COMPUTER_DRIVER_RELEASE_HTTP_FORBIDDEN,
  COMPUTER_DRIVER_RELEASE_HTTP_METHOD,
  COMPUTER_DRIVER_RELEASE_HTTP_NOT_FOUND,
  COMPUTER_DRIVER_RELEASE_HTTP_NOT_MODIFIED,
  COMPUTER_DRIVER_RELEASE_HTTP_TOO_MANY_REQUESTS,
  COMPUTER_DRIVER_RELEASE_IF_NONE_MATCH_HEADER_NAME,
  COMPUTER_DRIVER_RELEASE_JSON_ABSENT,
  COMPUTER_DRIVER_RELEASE_JSON_READ,
  COMPUTER_DRIVER_RELEASE_MISSING_CACHED_PAGE,
  COMPUTER_DRIVER_RELEASE_QUERY_FAILED,
  COMPUTER_DRIVER_RELEASE_RATE_LIMIT_EXHAUSTED,
  COMPUTER_DRIVER_RELEASE_RATE_LIMIT_REMAINING_HEADER_NAME,
  COMPUTER_DRIVER_RELEASE_RATE_LIMITED,
  COMPUTER_DRIVER_RELEASE_RESPONSE,
  COMPUTER_DRIVER_RELEASE_RESPONSE_TOO_LARGE,
  COMPUTER_DRIVER_RELEASE_TEXT_READ,
  COMPUTER_DRIVER_RELEASE_TIMEOUT_MILLISECONDS,
} from "./constants"
import {
  type ComputerDriverReleaseCachedJsonRead,
  type ComputerDriverReleaseCachedJsonRequest,
  type ComputerDriverReleaseCachedJsonResult,
  type ComputerDriverReleaseResponseRequest,
  type ComputerDriverReleaseResponseResult,
  type ComputerDriverReleaseTextRequest,
  type ComputerDriverReleaseTextResult,
} from "./types"

export async function computerFetchDriverRelease(
  request: ComputerDriverReleaseResponseRequest,
): Promise<ComputerDriverReleaseResponseResult> {
  try {
    const response = await request.fetch(request.url, {
      method: COMPUTER_DRIVER_RELEASE_HTTP_METHOD,
      headers: request.headers,
      signal: AbortSignal.timeout(COMPUTER_DRIVER_RELEASE_TIMEOUT_MILLISECONDS),
    })
    return { kind: COMPUTER_DRIVER_RELEASE_RESPONSE, response }
  } catch {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_QUERY_FAILED }
  }
}

export async function computerReadDriverReleaseCachedJson(
  request: ComputerDriverReleaseCachedJsonRequest,
): Promise<ComputerDriverReleaseCachedJsonResult> {
  const cached = request.cachedPages.find((entry) => entry.url === request.url)
  const headers = new Headers()
  headers.set(COMPUTER_DRIVER_RELEASE_ACCEPT_HEADER_NAME, COMPUTER_DRIVER_RELEASE_ACCEPT_HEADER)
  if (cached) {
    headers.set(COMPUTER_DRIVER_RELEASE_IF_NONE_MATCH_HEADER_NAME, cached.etag)
  }
  const fetched = await computerFetchDriverRelease({ fetch: request.fetch, url: request.url, headers })
  if (fetched.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return fetched
  }
  if (fetched.response.status === COMPUTER_DRIVER_RELEASE_HTTP_NOT_MODIFIED) {
    if (!cached) {
      return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_MISSING_CACHED_PAGE }
    }
    return {
      kind: COMPUTER_DRIVER_RELEASE_JSON_READ,
      text: cached.body,
      etag: cached.etag,
    }
  }
  if (fetched.response.status === COMPUTER_DRIVER_RELEASE_HTTP_NOT_FOUND && request.absentWhenNotFound) {
    return { kind: COMPUTER_DRIVER_RELEASE_JSON_ABSENT }
  }
  if (!fetched.response.ok) {
    return computerDriverReleaseResponseFailure(fetched.response)
  }
  const text = await computerReadReleaseResponseText(fetched.response, request.maxBytes)
  if (text.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return text
  }
  const read: ComputerDriverReleaseCachedJsonRead = {
    kind: COMPUTER_DRIVER_RELEASE_JSON_READ,
    text: text.text,
  }
  const etag = fetched.response.headers.get(COMPUTER_DRIVER_RELEASE_ETAG_HEADER_NAME)
  if (etag) {
    read.etag = etag
  }
  return read
}

export async function computerReadDriverReleaseText(
  request: ComputerDriverReleaseTextRequest,
): Promise<ComputerDriverReleaseTextResult> {
  const fetched = await computerFetchDriverRelease(request)
  if (fetched.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return fetched
  }
  if (!fetched.response.ok) {
    return computerDriverReleaseResponseFailure(fetched.response)
  }
  return computerReadReleaseResponseText(fetched.response, request.maxBytes)
}

export async function computerReadReleaseResponseText(
  response: Response,
  maxBytes: number,
): Promise<ComputerDriverReleaseTextResult> {
  const body = response.body
  if (!body) {
    return { kind: COMPUTER_DRIVER_RELEASE_TEXT_READ, text: "" }
  }
  const reader = body.getReader()
  const decoder = new TextDecoder()
  const parts: string[] = []
  let totalBytes = 0
  try {
    while (true) {
      const chunk = await reader.read()
      if (chunk.done) {
        parts.push(decoder.decode())
        return { kind: COMPUTER_DRIVER_RELEASE_TEXT_READ, text: parts.join("") }
      }
      totalBytes += chunk.value.byteLength
      if (totalBytes > maxBytes) {
        await computerCancelReleaseResponse(reader)
        return {
          kind: COMPUTER_DRIVER_RELEASE_FAILED,
          message: `${COMPUTER_DRIVER_RELEASE_RESPONSE_TOO_LARGE} ${maxBytes} bytes.`,
        }
      }
      parts.push(decoder.decode(chunk.value, { stream: true }))
    }
  } catch {
    await computerCancelReleaseResponse(reader)
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_QUERY_FAILED }
  } finally {
    reader.releaseLock()
  }
}

async function computerCancelReleaseResponse(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<void> {
  await reader.cancel().catch(() => undefined)
}

function computerDriverReleaseResponseFailure(response: Response): ComputerDriverReleaseFailed {
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
