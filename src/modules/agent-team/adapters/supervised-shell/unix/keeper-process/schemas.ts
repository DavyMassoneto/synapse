import { Type } from "typebox"

export const UNIX_KEEPER_SPEC_SCHEMA = Type.Object(
  {
    input: Type.Optional(Type.String()),
    executable: Type.String({ minLength: 1 }),
    arguments: Type.Array(Type.String()),
    cwd: Type.String({ minLength: 1 }),
    environment: Type.Array(
      Type.Object({ name: Type.String(), value: Type.String() }, { additionalProperties: false }),
    ),
  },
  { additionalProperties: false },
)
