import { type GithubConfiguration } from "#evaluator/configuration"
import { API_URL, API_VERSION, GET_METHOD, REQUEST_TIMEOUT_MS } from "./constants"
import { GithubTransportFailure } from "./transport-failure"

export async function fetchGithub(
  configuration: GithubConfiguration,
  path: string,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(`${API_URL}${path}`, {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${configuration.token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": API_VERSION,
      },
    })
  } catch {
    let method = GET_METHOD
    if (init.method) {
      method = init.method
    }
    throw new GithubTransportFailure(method, path)
  }
}
