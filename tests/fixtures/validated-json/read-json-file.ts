import { readFileSync } from "node:fs"
import { type Static, type TSchema } from "typebox"
import { Value } from "typebox/value"
import { VALIDATED_JSON_ENCODING } from "./constants"

export function readJsonFile<Schema extends TSchema>(path: string, schema: Schema): Static<Schema> {
  return Value.Parse(schema, JSON.parse(readFileSync(path, VALIDATED_JSON_ENCODING)))
}
