import { type Static, type TSchema } from "typebox"
import { type GithubConfiguration } from "#evaluator/configuration"
import { FIRST_ATTEMPT } from "./constants"
import { parseJson } from "./parse-json"
import { sendWithRetry } from "./send-with-retry"

export async function postJson<Schema extends TSchema>(
  configuration: GithubConfiguration,
  path: string,
  body: string,
  schema: Schema,
): Promise<Static<Schema>> {
  return parseJson(await sendWithRetry(configuration, path, { method: "POST", body }, FIRST_ATTEMPT), schema)
}
