import { COMPUTER_DRIVER_RELEASE_TAG_PREFIX, COMPUTER_DRIVER_RELEASE_TAG_REFS_PATH } from "./constants"

export function computerDriverReleaseRepositoryUrl(releasesApiUrl: string): string {
  const url = new URL(releasesApiUrl)
  const path = url.pathname.replace(/\/+$/, "")
  const repositoryPath = path.endsWith("/releases") ? path.slice(0, -"/releases".length) : path
  url.pathname = `${repositoryPath}/`
  url.search = ""
  url.hash = ""
  return url.toString()
}

export function computerDriverReleaseTagRefsUrl(releasesApiUrl: string): string {
  const repositoryUrl = computerDriverReleaseRepositoryUrl(releasesApiUrl)
  return new URL(
    `${COMPUTER_DRIVER_RELEASE_TAG_REFS_PATH}${COMPUTER_DRIVER_RELEASE_TAG_PREFIX}`,
    repositoryUrl,
  ).toString()
}

export function computerDriverReleaseTagUrl(releasesApiUrl: string, tag: string): string {
  const repositoryUrl = computerDriverReleaseRepositoryUrl(releasesApiUrl)
  return new URL(`releases/tags/${encodeURIComponent(tag)}`, repositoryUrl).toString()
}
