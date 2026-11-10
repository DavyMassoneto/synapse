import { type GithubConfiguration } from "#evaluator/configuration"
import { API_URL, API_VERSION } from "./constants"

export function fetchGithub(configuration: GithubConfiguration, path: string, init: RequestInit): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${configuration.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": API_VERSION,
    },
  })
}
