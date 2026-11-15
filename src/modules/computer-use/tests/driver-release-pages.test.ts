import { describe, expect, test } from "vitest"
import {
  COMPUTER_DRIVER_RELEASE_QUERY_FAILED,
  COMPUTER_DRIVER_RELEASE_RATE_LIMITED,
} from "#synapse/modules/computer-use/adapters/driver-release"
import {
  COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE,
  COMPUTER_DRIVER_RELEASE_MAX_PAGES,
  COMPUTER_DRIVER_RELEASE_MISSING_CACHED_PAGE,
  COMPUTER_DRIVER_RELEASE_PAGE_LIMIT_REACHED,
  COMPUTER_DRIVER_RELEASE_PER_PAGE,
  computerReadDriverReleasePages,
} from "#synapse/modules/computer-use/adapters/driver-release/release-page-reading"
import {
  COMPUTER_DRIVER_RELEASE_TEST_API_URL,
  COMPUTER_DRIVER_RELEASE_TEST_ETAG,
  COMPUTER_DRIVER_RELEASE_TEST_HTTP_FORBIDDEN,
  COMPUTER_DRIVER_RELEASE_TEST_HTTP_INTERNAL_ERROR,
  COMPUTER_DRIVER_RELEASE_TEST_HTTP_NOT_MODIFIED,
  COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
  COMPUTER_DRIVER_RELEASE_TEST_HTTP_TOO_MANY_REQUESTS,
  COMPUTER_DRIVER_RELEASE_TEST_RATE_LIMIT_EXHAUSTED,
  COMPUTER_DRIVER_RELEASE_TEST_RATE_LIMIT_HEADER,
} from "./driver-release-constants"
import {
  computerReleaseTestManyReleases,
  computerReleaseTestPage,
  computerReleaseTestPageUrl,
  computerReleaseTestStableRelease,
} from "./driver-release-fixtures"
import { ComputerFakeReleaseHttp } from "./driver-release-support"

async function paginationReadsNextPage(): Promise<void> {
  const firstPage = computerReleaseTestManyReleases(COMPUTER_DRIVER_RELEASE_PER_PAGE, "cua-spaces-v0.")
  const stale = computerReleaseTestStableRelease()
  const fake = new ComputerFakeReleaseHttp([
    {
      url: computerReleaseTestPageUrl(COMPUTER_DRIVER_RELEASE_TEST_API_URL, 1),
      status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
      body: computerReleaseTestPage(firstPage),
    },
    {
      url: computerReleaseTestPageUrl(COMPUTER_DRIVER_RELEASE_TEST_API_URL, 2),
      status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
      body: computerReleaseTestPage([stale]),
    },
  ])
  const result = await computerReadDriverReleasePages({
    fetch: fake.fetch,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-pages-read", releases: [...firstPage, stale], pages: [] })
  expect(fake.requests).toHaveLength(2)
}

async function conditionalRequestReusesCachedPage(): Promise<void> {
  const release = computerReleaseTestStableRelease()
  const url = computerReleaseTestPageUrl(COMPUTER_DRIVER_RELEASE_TEST_API_URL, 1)
  const cachedPages = [{ url, etag: COMPUTER_DRIVER_RELEASE_TEST_ETAG, body: computerReleaseTestPage([release]) }]
  const fake = new ComputerFakeReleaseHttp([{ url, status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_NOT_MODIFIED, body: "" }])
  const result = await computerReadDriverReleasePages({
    fetch: fake.fetch,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    cachedPages,
  })
  expect(result).toStrictEqual({ kind: "release-pages-read", releases: [release], pages: cachedPages })
  expect(fake.requests.map((entry) => entry.headers.get("if-none-match"))).toStrictEqual([
    COMPUTER_DRIVER_RELEASE_TEST_ETAG,
  ])
}

async function notModifiedWithoutCacheFails(): Promise<void> {
  const fake = new ComputerFakeReleaseHttp([
    {
      url: computerReleaseTestPageUrl(COMPUTER_DRIVER_RELEASE_TEST_API_URL, 1),
      status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_NOT_MODIFIED,
      body: "",
    },
  ])
  const result = await computerReadDriverReleasePages({
    fetch: fake.fetch,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_MISSING_CACHED_PAGE })
}

async function rateLimitFails(): Promise<void> {
  const fake = new ComputerFakeReleaseHttp([
    {
      url: computerReleaseTestPageUrl(COMPUTER_DRIVER_RELEASE_TEST_API_URL, 1),
      status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_TOO_MANY_REQUESTS,
      body: "",
    },
  ])
  const result = await computerReadDriverReleasePages({
    fetch: fake.fetch,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_RATE_LIMITED })
}

async function exhaustedForbiddenFails(): Promise<void> {
  const fake = new ComputerFakeReleaseHttp([
    {
      url: computerReleaseTestPageUrl(COMPUTER_DRIVER_RELEASE_TEST_API_URL, 1),
      status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_FORBIDDEN,
      body: "",
      headers: new Headers({
        [COMPUTER_DRIVER_RELEASE_TEST_RATE_LIMIT_HEADER]: COMPUTER_DRIVER_RELEASE_TEST_RATE_LIMIT_EXHAUSTED,
      }),
    },
  ])
  const result = await computerReadDriverReleasePages({
    fetch: fake.fetch,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_RATE_LIMITED })
}

async function invalidJsonFails(): Promise<void> {
  const fake = new ComputerFakeReleaseHttp([
    {
      url: computerReleaseTestPageUrl(COMPUTER_DRIVER_RELEASE_TEST_API_URL, 1),
      status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
      body: "não-json",
    },
  ])
  const result = await computerReadDriverReleasePages({
    fetch: fake.fetch,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE })
}

async function pageLimitFails(): Promise<void> {
  const fullPage = computerReleaseTestManyReleases(COMPUTER_DRIVER_RELEASE_PER_PAGE, "cua-spaces-v0.")
  const fake = new ComputerFakeReleaseHttp(
    Array.from({ length: COMPUTER_DRIVER_RELEASE_MAX_PAGES }, (_, index) => ({
      url: computerReleaseTestPageUrl(COMPUTER_DRIVER_RELEASE_TEST_API_URL, index + 1),
      status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_OK,
      body: computerReleaseTestPage(fullPage),
    })),
  )
  const result = await computerReadDriverReleasePages({
    fetch: fake.fetch,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_PAGE_LIMIT_REACHED })
  expect(fake.requests).toHaveLength(COMPUTER_DRIVER_RELEASE_MAX_PAGES)
}

async function cachedPageIsNotUsedWhenRequestFails(): Promise<void> {
  const url = computerReleaseTestPageUrl(COMPUTER_DRIVER_RELEASE_TEST_API_URL, 1)
  const cachedPages = [
    {
      url,
      etag: COMPUTER_DRIVER_RELEASE_TEST_ETAG,
      body: computerReleaseTestPage([computerReleaseTestStableRelease()]),
    },
  ]
  const fake = new ComputerFakeReleaseHttp([
    { url, status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_INTERNAL_ERROR, body: "" },
  ])
  const result = await computerReadDriverReleasePages({
    fetch: fake.fetch,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    cachedPages,
  })
  expect(result).toStrictEqual({
    kind: "release-failed",
    message: `${COMPUTER_DRIVER_RELEASE_QUERY_FAILED} HTTP ${COMPUTER_DRIVER_RELEASE_TEST_HTTP_INTERNAL_ERROR}.`,
  })
}

describe("leitura das páginas de release do driver", () => {
  test("pagina até a página incompleta", paginationReadsNextPage)
  test("revalida com ETag e reutiliza a página em 304", conditionalRequestReusesCachedPage)
  test("recusa 304 sem página em cache", notModifiedWithoutCacheFails)
  test("recusa rate limit 429", rateLimitFails)
  test("recusa 403 com limite de requisições esgotado", exhaustedForbiddenFails)
  test("recusa JSON inválido", invalidJsonFails)
  test("recusa ao atingir o limite de páginas", pageLimitFails)
  test("não usa cache quando a consulta falha", cachedPageIsNotUsedWhenRequestFails)
})
