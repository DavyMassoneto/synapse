import { Type } from "typebox"

const PI_PROCESS_STEP_SCHEMA = Type.Union([
  Type.Object({ kind: Type.Literal("text"), text: Type.String() }),
  Type.Object({ kind: Type.Literal("toolCall"), name: Type.String(), argumentsJson: Type.String() }),
])

export const PI_PROCESS_SCRIPT_SCHEMA = Type.Array(PI_PROCESS_STEP_SCHEMA)
