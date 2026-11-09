import { type Static, type TSchema } from "typebox"
import { Value } from "typebox/value"
import { type GithubConfiguration } from "#evaluator/configuration"
import { sendWithRetry } from "./send-with-retry"

export async function getJson<Schema extends TSchema>(
  configuration: GithubConfiguration,
  path: string,
  schema: Schema,
): Promise<Static<Schema>> {
  const response = await sendWithRetry(configuration, path, { method: "GET" }, 1)
  return Value.Parse(schema, await response.json())
}
