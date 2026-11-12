import { type Static, type TSchema } from "typebox"
import { Value } from "typebox/value"
import { GithubTransportFailure } from "./transport-failure"

export async function readGithubResponse<Schema extends TSchema>(
  response: Response,
  method: string,
  path: string,
  schema: Schema,
): Promise<Static<Schema>> {
  let text: string
  try {
    text = await response.text()
  } catch {
    throw new GithubTransportFailure(method, path)
  }
  return Value.Parse(schema, JSON.parse(text))
}
