import { setTimeout as delay } from "node:timers/promises"
import { type Static, type TSchema } from "typebox"
import { type GithubConfiguration } from "#evaluator/configuration"
import { GET_METHOD, POST_METHOD, REQUEST_ATTEMPTS, TRANSPORT_RETRY_DELAY_MS, TRANSPORT_RETRY_LABEL } from "./constants"
import { readGithubResponse } from "./read-response"
import { sendWithRetry } from "./send-with-retry"
import { GithubTransportFailure } from "./transport-failure"

export async function getJson<Schema extends TSchema>(
  configuration: GithubConfiguration,
  path: string,
  schema: Schema,
): Promise<Static<Schema>> {
  for (let attempt = 1; attempt < REQUEST_ATTEMPTS; attempt += 1) {
    try {
      const response = await sendWithRetry(configuration, path, { method: GET_METHOD })
      return await readGithubResponse(response, GET_METHOD, path, schema)
    } catch (error) {
      if (!(error instanceof GithubTransportFailure)) {
        throw error
      }
      console.log(`${TRANSPORT_RETRY_LABEL}${JSON.stringify(GET_METHOD)} ${JSON.stringify(path)}`)
      await delay(TRANSPORT_RETRY_DELAY_MS)
    }
  }
  const response = await sendWithRetry(configuration, path, { method: GET_METHOD })
  return readGithubResponse(response, GET_METHOD, path, schema)
}

export async function postJson<Schema extends TSchema>(
  configuration: GithubConfiguration,
  path: string,
  body: string,
  schema: Schema,
): Promise<Static<Schema>> {
  const response = await sendWithRetry(configuration, path, { method: POST_METHOD, body })
  return readGithubResponse(response, POST_METHOD, path, schema)
}
