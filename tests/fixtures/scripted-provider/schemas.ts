import { Type } from "typebox"

const SCRIPTED_PROVIDER_STEP_SCHEMA = Type.Union([
  Type.Object({ kind: Type.Literal("text"), text: Type.String() }),
  Type.Object({ kind: Type.Literal("toolCall"), name: Type.String(), argumentsJson: Type.String() }),
])

export const SCRIPTED_PROVIDER_SCRIPT_SCHEMA = Type.Array(SCRIPTED_PROVIDER_STEP_SCHEMA)
