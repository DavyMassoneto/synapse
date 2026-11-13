import { Type } from "typebox"

export const ReviewListSchema = Type.Array(
  Type.Object({
    body: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    commit_id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    user: Type.Optional(Type.Union([Type.Object({ login: Type.String() }), Type.Null()])),
  }),
)
