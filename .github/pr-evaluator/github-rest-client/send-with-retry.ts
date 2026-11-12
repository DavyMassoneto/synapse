import { setTimeout as delay } from "node:timers/promises"
import { type GithubConfiguration } from "#evaluator/configuration"
import { ensureOk } from "#evaluator/http-failure"
import {
  DEFAULT_RETRY_SECONDS,
  GET_METHOD,
  MAX_RETRY_SECONDS,
  MILLISECONDS_PER_SECOND,
  REQUEST_ATTEMPTS,
  RETRY_AFTER_HEADER,
} from "./constants"
import { fetchGithub } from "./fetch-github"
import { isRateLimited } from "./predicates"
import { type GithubRequest } from "./types"

function retryDelayMs(response: Response): number {
  const seconds = Number(response.headers.get(RETRY_AFTER_HEADER))
  if (seconds > MAX_RETRY_SECONDS) {
    throw new Error(`O GitHub pediu uma espera de ${seconds} segundos, acima do limite de ${MAX_RETRY_SECONDS}`)
  }
  if (seconds > 0) {
    return seconds * MILLISECONDS_PER_SECOND
  }
  return DEFAULT_RETRY_SECONDS * MILLISECONDS_PER_SECOND
}

export async function sendWithRetry(
  configuration: GithubConfiguration,
  path: string,
  init: GithubRequest,
): Promise<Response> {
  let response = await fetchGithub(configuration, path, init)
  for (
    let attempt = 1;
    attempt < REQUEST_ATTEMPTS && init.method === GET_METHOD && isRateLimited(response);
    attempt += 1
  ) {
    console.log(
      `GitHub ${JSON.stringify(init.method)} ${JSON.stringify(path)} limitou a taxa (${response.status}); nova tentativa`,
    )
    await response.body?.cancel()
    await delay(retryDelayMs(response))
    response = await fetchGithub(configuration, path, init)
  }
  return ensureOk(response, `GitHub ${JSON.stringify(init.method)} ${JSON.stringify(path)}`)
}
