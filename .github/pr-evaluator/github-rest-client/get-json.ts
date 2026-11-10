import { type Static, type TSchema } from "typebox"
import { type GithubConfiguration } from "#evaluator/configuration"
import { requestJson } from "./request-json"

export function getJson<Schema extends TSchema>(
  configuration: GithubConfiguration,
  path: string,
  schema: Schema,
): Promise<Static<Schema>> {
  return requestJson(configuration, path, { method: "GET" }, schema)
}
