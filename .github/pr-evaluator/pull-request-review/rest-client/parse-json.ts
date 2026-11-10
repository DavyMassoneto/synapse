import { type Static, type TSchema } from "typebox"
import { Value } from "typebox/value"

export async function parseJson<Schema extends TSchema>(response: Response, schema: Schema): Promise<Static<Schema>> {
  return Value.Parse(schema, await response.json())
}
