import {
  COMPUTER_DRIVER_RELEASE_FAILED,
  COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE,
  COMPUTER_DRIVER_RELEASE_JSON_ABSENT,
  COMPUTER_DRIVER_RELEASE_JSON_READ,
  COMPUTER_DRIVER_RELEASE_MAX_RELEASE_BYTES,
  COMPUTER_DRIVER_RELEASE_RELEASE_DETAIL_ABSENT,
  COMPUTER_DRIVER_RELEASE_RELEASE_DETAIL_READ,
} from "../constants"
import { computerReadDriverReleaseCachedJson } from "../read-release-response"
import { computerDriverReleaseTagUrl } from "../urls"
import { computerParseDriverReleaseDetail } from "./parse-release-detail"
import {
  type ComputerDriverReleaseDetailRead,
  type ComputerDriverReleaseDetailRequest,
  type ComputerDriverReleaseDetailResult,
} from "./types"

export async function computerReadDriverReleaseDetail(
  request: ComputerDriverReleaseDetailRequest,
): Promise<ComputerDriverReleaseDetailResult> {
  let url: string
  try {
    url = computerDriverReleaseTagUrl(request.releasesApiUrl, request.tag)
  } catch {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE }
  }
  const read = await computerReadDriverReleaseCachedJson({
    fetch: request.fetch,
    url,
    cachedPages: request.cachedPages,
    maxBytes: COMPUTER_DRIVER_RELEASE_MAX_RELEASE_BYTES,
    absentWhenNotFound: true,
  })
  if (read.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return read
  }
  if (read.kind === COMPUTER_DRIVER_RELEASE_JSON_ABSENT) {
    return { kind: COMPUTER_DRIVER_RELEASE_RELEASE_DETAIL_ABSENT }
  }
  if (read.kind !== COMPUTER_DRIVER_RELEASE_JSON_READ) {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE }
  }
  const parsed = computerParseDriverReleaseDetail(read.text, request.tag)
  if (parsed.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return parsed
  }
  const pages = read.etag ? [{ url, etag: read.etag, body: read.text }] : []
  const result: ComputerDriverReleaseDetailRead = {
    kind: COMPUTER_DRIVER_RELEASE_RELEASE_DETAIL_READ,
    release: parsed.release,
    pages,
  }
  return result
}
