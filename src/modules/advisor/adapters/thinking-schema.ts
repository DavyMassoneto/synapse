import { Type } from "typebox"
import { type ThinkingLevel } from "#synapse/modules/advisor/public/contracts"

export function thinkingLiteral(level: ThinkingLevel) {
  return Type.Literal(level)
}
