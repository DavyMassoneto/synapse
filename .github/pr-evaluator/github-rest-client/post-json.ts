import { type Static, type TSchema } from "typebox"
import { type GithubConfiguration } from "#evaluator/configuration"
import { requestJson } from "./request-json"

export function postJson<Schema extends TSchema>(
  configuration: GithubConfiguration,
  path: string,
  body: string,
  schema: Schema,
): Promise<Static<Schema>> {
  return requestJson(configuration, path, { method: "POST", body }, schema)
}
