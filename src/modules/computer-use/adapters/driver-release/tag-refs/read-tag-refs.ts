import {
  COMPUTER_DRIVER_RELEASE_FAILED,
  COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE,
  COMPUTER_DRIVER_RELEASE_JSON_READ,
  COMPUTER_DRIVER_RELEASE_MAX_TAG_REFS_BYTES,
  COMPUTER_DRIVER_RELEASE_TAG_REFS_READ,
} from "../constants"
import { computerReadDriverReleaseCachedJson } from "../read-release-response"
import { computerDriverReleaseTagRefsUrl } from "../urls"
import { computerParseDriverReleaseTagRefs } from "./parse-tag-refs"
import {
  type ComputerDriverReleaseTagRefsRead,
  type ComputerDriverReleaseTagRefsRequest,
  type ComputerDriverReleaseTagRefsResult,
} from "./types"

export async function computerReadDriverReleaseTagRefs(
  request: ComputerDriverReleaseTagRefsRequest,
): Promise<ComputerDriverReleaseTagRefsResult> {
  let url: string
  try {
    url = computerDriverReleaseTagRefsUrl(request.releasesApiUrl)
  } catch {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE }
  }
  const read = await computerReadDriverReleaseCachedJson({
    fetch: request.fetch,
    url,
    cachedPages: request.cachedPages,
    maxBytes: COMPUTER_DRIVER_RELEASE_MAX_TAG_REFS_BYTES,
    absentWhenNotFound: false,
  })
  if (read.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return read
  }
  if (read.kind !== COMPUTER_DRIVER_RELEASE_JSON_READ) {
    return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE }
  }
  const parsed = computerParseDriverReleaseTagRefs(read.text)
  if (parsed.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
    return parsed
  }
  const pages = read.etag ? [{ url, etag: read.etag, body: read.text }] : []
  const result: ComputerDriverReleaseTagRefsRead = {
    kind: COMPUTER_DRIVER_RELEASE_TAG_REFS_READ,
    refs: parsed.refs,
    pages,
  }
  return result
}
