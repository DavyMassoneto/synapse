import { type Static, type TSchema } from "typebox"
import { Value } from "typebox/value"
import { type GithubConfiguration } from "#evaluator/configuration"
import { sendWithRetry } from "./send-with-retry"

export async function postJson<Schema extends TSchema>(
  configuration: GithubConfiguration,
  path: string,
  body: string,
  schema: Schema,
): Promise<Static<Schema>> {
  const response = await sendWithRetry(configuration, path, { method: "POST", body }, 1)
  return Value.Parse(schema, await response.json())
}
