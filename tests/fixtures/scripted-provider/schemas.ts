import { Type } from "typebox"

const SCRIPTED_PROVIDER_STEP_SCHEMA = Type.Union([
  Type.Object({ kind: Type.Literal("error"), text: Type.String() }),
  Type.Object({ kind: Type.Literal("text"), text: Type.String() }),
  Type.Object({ kind: Type.Literal("toolCall"), name: Type.String(), argumentsJson: Type.String() }),
])

export const SCRIPTED_PROVIDER_STEPS_SCHEMA = Type.Array(SCRIPTED_PROVIDER_STEP_SCHEMA)

export const SCRIPTED_PROVIDER_TRACKS_SCHEMA = Type.Array(
  Type.Object({ marker: Type.Optional(Type.String({ minLength: 1 })), steps: SCRIPTED_PROVIDER_STEPS_SCHEMA }),
)

export const SCRIPTED_PROVIDER_SCRIPT_SCHEMA = Type.Union([
  SCRIPTED_PROVIDER_STEPS_SCHEMA,
  Type.Object({ tracks: SCRIPTED_PROVIDER_TRACKS_SCHEMA }),
])

export const SCRIPTED_PROVIDER_TRACK_OFFSET_SCHEMA = Type.Object({ index: Type.Integer({ minimum: 0 }) })
