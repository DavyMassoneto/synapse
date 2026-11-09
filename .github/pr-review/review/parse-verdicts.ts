import { Value } from "typebox/value"
import { ModelError } from "../errors"
import { fillTemplate } from "../templates"
import { ERROR_INVALID_REPLY, ERROR_NO_JSON, JSON_OBJECT } from "./constants"
import { VerdictsSchema } from "./schemas"
import { type Verdicts } from "./types"

export function parseVerdicts(text: string): Verdicts {
  const json = JSON_OBJECT.exec(text)?.at(0)
  if (json === undefined) {
    throw new ModelError(ERROR_NO_JSON)
  }
  try {
    return Value.Parse(VerdictsSchema, JSON.parse(json))
  } catch (error) {
    throw new ModelError(fillTemplate(ERROR_INVALID_REPLY, [error instanceof Error ? error.message : text]))
  }
}
