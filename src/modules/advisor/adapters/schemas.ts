import { Type } from "typebox"
import { THINKING_LEVELS } from "#synapse/modules/advisor/public/contracts"

export const thinkingLevelSchema = Type.Enum(THINKING_LEVELS)

export const configSchema = Type.Object({
  model: Type.Optional(Type.String()),
  thinking: Type.Optional(thinkingLevelSchema),
})
