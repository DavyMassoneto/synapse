import { type Static, type TSchema } from "typebox"
import { Value } from "typebox/value"
import { COMPUTER_RESPONSE_JSON_START } from "./constants"

export function computerParseDriverJson<T extends TSchema>(schema: T, text: string): Static<T> {
  return Value.Parse(schema, JSON.parse(text.slice(text.indexOf(COMPUTER_RESPONSE_JSON_START))))
}
