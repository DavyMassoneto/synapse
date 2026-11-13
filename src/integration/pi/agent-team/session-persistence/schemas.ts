import { Type } from "typebox"

export const TEAM_PI_MEMBER_HEADER_SCHEMA = Type.Object({
  type: Type.Literal("session"),
  id: Type.String({ minLength: 1 }),
  cwd: Type.String({ minLength: 1 }),
})

export const TEAM_PI_MEMBER_ENTRY_SCHEMA = Type.Object({ type: Type.String({ minLength: 1 }) })

export const TEAM_PI_MEMBER_CHECKPOINT_SCHEMA = Type.Object({
  interrupted: Type.Boolean(),
  pending: Type.Array(Type.String()),
})
