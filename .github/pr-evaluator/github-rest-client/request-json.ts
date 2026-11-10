import { type Static, type TSchema } from "typebox"
import { Value } from "typebox/value"
import { type GithubConfiguration } from "#evaluator/configuration"
import { sendWithRetry } from "./send-with-retry"

async function requestJson<Schema extends TSchema>(
  configuration: GithubConfiguration,
  path: string,
  init: RequestInit,
  schema: Schema,
): Promise<Static<Schema>> {
  const response = await sendWithRetry(configuration, path, init)
  return Value.Parse(schema, await response.json())
}

export function getJson<Schema extends TSchema>(
  configuration: GithubConfiguration,
  path: string,
  schema: Schema,
): Promise<Static<Schema>> {
  return requestJson(configuration, path, { method: "GET" }, schema)
}

export function postJson<Schema extends TSchema>(
  configuration: GithubConfiguration,
  path: string,
  body: string,
  schema: Schema,
): Promise<Static<Schema>> {
  return requestJson(configuration, path, { method: "POST", body }, schema)
}
