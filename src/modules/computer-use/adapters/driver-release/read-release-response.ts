import {
  COMPUTER_DRIVER_RELEASE_FAILED,
  COMPUTER_DRIVER_RELEASE_HTTP_METHOD,
  COMPUTER_DRIVER_RELEASE_QUERY_FAILED,
  COMPUTER_DRIVER_RELEASE_RESPONSE,
  COMPUTER_DRIVER_RELEASE_RESPONSE_TOO_LARGE,
  COMPUTER_DRIVER_RELEASE_TEXT_READ,
  COMPUTER_DRIVER_RELEASE_TIMEOUT_MILLISECONDS,
} from "./constants"
import {
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

export async function computerReadDriverReleaseText(
  request: ComputerDriverReleaseTextRequest,
): Promise<ComputerDriverReleaseTextResult> {
  const fetched = await computerFetchDriverRelease(request)
  if (fetched.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return fetched
  }
  if (!fetched.response.ok) {
    return {
      kind: COMPUTER_DRIVER_RELEASE_FAILED,
      message: `${COMPUTER_DRIVER_RELEASE_QUERY_FAILED} HTTP ${fetched.response.status}.`,
    }
  }
  return computerReadReleaseResponseText(fetched.response, request.maxBytes)
}

export async function computerReadReleaseResponseText(
  response: Response,
  maxBytes: number,
): Promise<ComputerDriverReleaseTextResult> {
  try {
    const text = await response.text()
    if (new TextEncoder().encode(text).byteLength > maxBytes) {
      return {
        kind: COMPUTER_DRIVER_RELEASE_FAILED,
        message: `${COMPUTER_DRIVER_RELEASE_RESPONSE_TOO_LARGE} ${maxBytes} bytes.`,
      }
    }
    return { kind: COMPUTER_DRIVER_RELEASE_TEXT_READ, text }
  } catch {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_QUERY_FAILED }
  }
}
