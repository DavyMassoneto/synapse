import { Type } from "typebox"

export const HISTORY_MIGRATION_AGENTS_SCHEMA = Type.Array(
  Type.Object({
    name: Type.String(),
    description: Type.String(),
    state: Type.String(),
    status: Type.String(),
    activity: Type.String(),
  }),
)

export const HISTORY_MIGRATION_TASKS_SCHEMA = Type.Array(
  Type.Object({
    id: Type.String(),
    revision: Type.Number(),
    subject: Type.String(),
    status: Type.String(),
    owner: Type.Optional(Type.String()),
  }),
)
