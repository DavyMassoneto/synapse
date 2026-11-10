import { type Static, type TSchema } from "typebox"
import { type GithubConfiguration } from "#evaluator/configuration"
import { parseJson } from "./parse-json"
import { sendWithRetry } from "./send-with-retry"

export async function getJson<Schema extends TSchema>(
  configuration: GithubConfiguration,
  path: string,
  schema: Schema,
): Promise<Static<Schema>> {
  return parseJson(await sendWithRetry(configuration, path, { method: "GET" }, 1), schema)
}
