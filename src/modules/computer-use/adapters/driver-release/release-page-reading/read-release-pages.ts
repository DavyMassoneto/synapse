import { type ComputerDriverReleaseCachedPage } from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_DRIVER_RELEASE_FAILED } from "../constants"
import { type ComputerDriverReleaseRecord } from "../types"
import {
  COMPUTER_DRIVER_RELEASE_MAX_PAGES,
  COMPUTER_DRIVER_RELEASE_PAGE_LIMIT_REACHED,
  COMPUTER_DRIVER_RELEASE_PAGE_PARAMETER,
  COMPUTER_DRIVER_RELEASE_PAGES_READ,
  COMPUTER_DRIVER_RELEASE_PER_PAGE,
  COMPUTER_DRIVER_RELEASE_PER_PAGE_PARAMETER,
} from "./constants"
import { computerReadDriverReleasePage } from "./read-release-page"
import {
  type ComputerDriverReleasePageRequest,
  type ComputerDriverReleasePagesRequest,
  type ComputerDriverReleasePagesResult,
} from "./types"

export async function computerReadDriverReleasePages(
  request: ComputerDriverReleasePagesRequest,
): Promise<ComputerDriverReleasePagesResult> {
  const releases: ComputerDriverReleaseRecord[] = []
  const pages: ComputerDriverReleaseCachedPage[] = []
  let page = 1
  let hasMore = true
  while (hasMore) {
    if (page > COMPUTER_DRIVER_RELEASE_MAX_PAGES) {
      return { kind: COMPUTER_DRIVER_RELEASE_FAILED, message: COMPUTER_DRIVER_RELEASE_PAGE_LIMIT_REACHED }
    }
    const url = computerReleasePageUrl(request.releasesApiUrl, page)
    const read = await computerReadDriverReleasePage(computerReleasePageRequest(request, url))
    if (read.kind === COMPUTER_DRIVER_RELEASE_FAILED) {
      return read
    }
    releases.push(...read.releases)
    if (read.etag) {
      pages.push({ url, etag: read.etag, body: read.body })
    }
    hasMore = read.releases.length === COMPUTER_DRIVER_RELEASE_PER_PAGE
    page += 1
  }
  return { kind: COMPUTER_DRIVER_RELEASE_PAGES_READ, releases, pages }
}

function computerReleasePageRequest(
  request: ComputerDriverReleasePagesRequest,
  url: string,
): ComputerDriverReleasePageRequest {
  const cached = request.cachedPages.find((entry) => entry.url === url)
  const pageRequest: ComputerDriverReleasePageRequest = { fetch: request.fetch, url }
  if (cached) {
    pageRequest.cached = cached
  }
  return pageRequest
}

function computerReleasePageUrl(releasesApiUrl: string, page: number): string {
  const url = new URL(releasesApiUrl)
  url.searchParams.set(COMPUTER_DRIVER_RELEASE_PER_PAGE_PARAMETER, `${COMPUTER_DRIVER_RELEASE_PER_PAGE}`)
  url.searchParams.set(COMPUTER_DRIVER_RELEASE_PAGE_PARAMETER, `${page}`)
  return url.toString()
}
