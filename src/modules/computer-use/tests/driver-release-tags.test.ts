import { describe, expect, test } from "vitest"
import {
  COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE,
  COMPUTER_DRIVER_RELEASE_MISSING_CACHED_PAGE,
  COMPUTER_DRIVER_RELEASE_QUERY_FAILED,
  COMPUTER_DRIVER_RELEASE_RATE_LIMITED,
  COMPUTER_DRIVER_RELEASE_TAG_REFS_READ,
} from "#synapse/modules/computer-use/adapters/driver-release"
import { computerReadDriverReleaseTagRefs } from "#synapse/modules/computer-use/adapters/driver-release/tag-refs"
import {
  COMPUTER_DRIVER_RELEASE_TEST_API_URL,
  COMPUTER_DRIVER_RELEASE_TEST_ETAG,
  COMPUTER_DRIVER_RELEASE_TEST_HTTP_FORBIDDEN,
  COMPUTER_DRIVER_RELEASE_TEST_HTTP_INTERNAL_ERROR,
  COMPUTER_DRIVER_RELEASE_TEST_HTTP_NOT_MODIFIED,
  COMPUTER_DRIVER_RELEASE_TEST_HTTP_TOO_MANY_REQUESTS,
  COMPUTER_DRIVER_RELEASE_TEST_RATE_LIMIT_EXHAUSTED,
  COMPUTER_DRIVER_RELEASE_TEST_RATE_LIMIT_HEADER,
  COMPUTER_DRIVER_RELEASE_TEST_TAG,
} from "./driver-release-constants"
import { computerReleaseTestTagRef, computerReleaseTestTagRefsRoute } from "./driver-release-fixtures"
import { ComputerFakeReleaseHttp } from "./driver-release-support"

async function readsEveryReturnedRef(): Promise<void> {
  const tags = Array.from({ length: 150 }, (_, index) => `cua-driver-rs-v0.${index + 1}.0`)
  const route = computerReleaseTestTagRefsRoute(
    COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    tags,
    COMPUTER_DRIVER_RELEASE_TEST_ETAG,
  )
  const fake = new ComputerFakeReleaseHttp([route])
  const result = await computerReadDriverReleaseTagRefs({
    fetch: fake.fetch,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({
    kind: COMPUTER_DRIVER_RELEASE_TAG_REFS_READ,
    refs: tags.map(computerReleaseTestTagRef),
    pages: [{ url: route.url, etag: COMPUTER_DRIVER_RELEASE_TEST_ETAG, body: route.body }],
  })
  expect(fake.requests).toHaveLength(1)
}

async function conditionalRequestReusesCachedRefs(): Promise<void> {
  const route = computerReleaseTestTagRefsRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, [
    COMPUTER_DRIVER_RELEASE_TEST_TAG,
  ])
  const cachedPages = [{ url: route.url, etag: COMPUTER_DRIVER_RELEASE_TEST_ETAG, body: route.body }]
  const fake = new ComputerFakeReleaseHttp([
    { url: route.url, status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_NOT_MODIFIED, body: "" },
  ])
  const result = await computerReadDriverReleaseTagRefs({
    fetch: fake.fetch,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    cachedPages,
  })
  expect(result).toStrictEqual({
    kind: COMPUTER_DRIVER_RELEASE_TAG_REFS_READ,
    refs: [computerReleaseTestTagRef(COMPUTER_DRIVER_RELEASE_TEST_TAG)],
    pages: cachedPages,
  })
  expect(fake.requests.map((entry) => entry.headers.get("if-none-match"))).toStrictEqual([
    COMPUTER_DRIVER_RELEASE_TEST_ETAG,
  ])
}

async function notModifiedWithoutCacheFails(): Promise<void> {
  const route = computerReleaseTestTagRefsRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, [])
  const fake = new ComputerFakeReleaseHttp([
    { url: route.url, status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_NOT_MODIFIED, body: "" },
  ])
  const result = await computerReadDriverReleaseTagRefs({
    fetch: fake.fetch,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_MISSING_CACHED_PAGE })
}

async function rateLimitFails(): Promise<void> {
  const route = computerReleaseTestTagRefsRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, [])
  const fake = new ComputerFakeReleaseHttp([
    { url: route.url, status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_TOO_MANY_REQUESTS, body: "" },
  ])
  const result = await computerReadDriverReleaseTagRefs({
    fetch: fake.fetch,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_RATE_LIMITED })
}

async function exhaustedForbiddenFails(): Promise<void> {
  const route = computerReleaseTestTagRefsRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, [])
  const fake = new ComputerFakeReleaseHttp([
    {
      url: route.url,
      status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_FORBIDDEN,
      body: "",
      headers: new Headers({
        [COMPUTER_DRIVER_RELEASE_TEST_RATE_LIMIT_HEADER]: COMPUTER_DRIVER_RELEASE_TEST_RATE_LIMIT_EXHAUSTED,
      }),
    },
  ])
  const result = await computerReadDriverReleaseTagRefs({
    fetch: fake.fetch,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_RATE_LIMITED })
}

async function invalidJsonFails(): Promise<void> {
  const route = computerReleaseTestTagRefsRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, [])
  const fake = new ComputerFakeReleaseHttp([{ url: route.url, status: 200, body: "não-json" }])
  const result = await computerReadDriverReleaseTagRefs({
    fetch: fake.fetch,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE })
}

async function invalidSchemaFails(): Promise<void> {
  const route = computerReleaseTestTagRefsRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, [])
  const fake = new ComputerFakeReleaseHttp([{ url: route.url, status: 200, body: "[{}]" }])
  const result = await computerReadDriverReleaseTagRefs({
    fetch: fake.fetch,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    cachedPages: [],
  })
  expect(result).toStrictEqual({ kind: "release-failed", message: COMPUTER_DRIVER_RELEASE_INVALID_RESPONSE })
}

async function cachedRefsAreNotUsedWhenRequestFails(): Promise<void> {
  const route = computerReleaseTestTagRefsRoute(COMPUTER_DRIVER_RELEASE_TEST_API_URL, [
    COMPUTER_DRIVER_RELEASE_TEST_TAG,
  ])
  const cachedPages = [{ url: route.url, etag: COMPUTER_DRIVER_RELEASE_TEST_ETAG, body: route.body }]
  const fake = new ComputerFakeReleaseHttp([
    { url: route.url, status: COMPUTER_DRIVER_RELEASE_TEST_HTTP_INTERNAL_ERROR, body: "" },
  ])
  const result = await computerReadDriverReleaseTagRefs({
    fetch: fake.fetch,
    releasesApiUrl: COMPUTER_DRIVER_RELEASE_TEST_API_URL,
    cachedPages,
  })
  expect(result).toStrictEqual({
    kind: "release-failed",
    message: `${COMPUTER_DRIVER_RELEASE_QUERY_FAILED} HTTP ${COMPUTER_DRIVER_RELEASE_TEST_HTTP_INTERNAL_ERROR}.`,
  })
}

describe("refs de tag das releases do driver", () => {
  test("lê todas as refs devolvidas em uma resposta", readsEveryReturnedRef)
  test("revalida com ETag e reutiliza a resposta em 304", conditionalRequestReusesCachedRefs)
  test("recusa 304 sem resposta em cache", notModifiedWithoutCacheFails)
  test("recusa rate limit 429", rateLimitFails)
  test("recusa 403 com limite de requisições esgotado", exhaustedForbiddenFails)
  test("recusa JSON inválido", invalidJsonFails)
  test("recusa schema inválido", invalidSchemaFails)
  test("não usa cache quando a consulta falha", cachedRefsAreNotUsedWhenRequestFails)
})
