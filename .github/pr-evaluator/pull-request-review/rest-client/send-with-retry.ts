import { type GithubConfiguration } from "#evaluator/configuration"
import { ensureOk } from "./ensure-ok"
import { fetchGithub } from "./fetch-github"
import { isRetryableResponse } from "./predicates"
import { waitForRateLimit } from "./wait-for-rate-limit"

export async function sendWithRetry(
  configuration: GithubConfiguration,
  path: string,
  init: RequestInit,
  attempt: number,
): Promise<Response> {
  const response = await fetchGithub(configuration, path, init)
  if (isRetryableResponse(response, attempt)) {
    await waitForRateLimit(response)
    return sendWithRetry(configuration, path, init, attempt + 1)
  }
  return ensureOk(response, path)
}
