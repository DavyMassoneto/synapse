import { type GithubConfiguration } from "#evaluator/configuration"
import { API_URL, API_VERSION, REQUEST_TIMEOUT_MS } from "./constants"

export function fetchGithub(configuration: GithubConfiguration, path: string, init: RequestInit): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...init,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${configuration.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": API_VERSION,
    },
  })
}
