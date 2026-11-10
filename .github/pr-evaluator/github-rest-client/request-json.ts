import { type Static, type TSchema } from "typebox"
import { Value } from "typebox/value"
import { type GithubConfiguration } from "#evaluator/configuration"
import { FIRST_ATTEMPT } from "./constants"
import { sendWithRetry } from "./send-with-retry"

export async function requestJson<Schema extends TSchema>(
  configuration: GithubConfiguration,
  path: string,
  init: RequestInit,
  schema: Schema,
): Promise<Static<Schema>> {
  const response = await sendWithRetry(configuration, path, init, FIRST_ATTEMPT)
  return Value.Parse(schema, await response.json())
}
