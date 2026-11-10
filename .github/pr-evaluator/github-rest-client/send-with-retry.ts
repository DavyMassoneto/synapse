import { setTimeout as delay } from "node:timers/promises"
import { type GithubConfiguration } from "#evaluator/configuration"
import { readFailureDetail } from "#evaluator/http-failure"
import { REQUEST_ATTEMPTS } from "./constants"
import { fetchGithub } from "./fetch-github"
import { isRateLimited } from "./predicates"
import { retryDelayMs } from "./retry-delay"

async function ensureOk(response: Response, path: string): Promise<Response> {
  if (response.ok) {
    return response
  }
  throw new Error(`GitHub respondeu ${response.status} em ${path}: ${await readFailureDetail(response)}`)
}

export async function sendWithRetry(
  configuration: GithubConfiguration,
  path: string,
  init: RequestInit,
  attempt: number,
): Promise<Response> {
  const response = await fetchGithub(configuration, path, init)
  if (isRateLimited(response) && attempt < REQUEST_ATTEMPTS) {
    console.log(`GitHub limitou a taxa (${response.status}); nova tentativa`)
    await delay(retryDelayMs(response))
    return sendWithRetry(configuration, path, init, attempt + 1)
  }
  return ensureOk(response, path)
}
