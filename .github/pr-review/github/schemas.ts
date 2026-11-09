import Type from "typebox"

export const CommentSchema = Type.Object({
  id: Type.Integer(),
  body: Type.String(),
  user: Type.Object({ login: Type.String() }),
})

export const CommentPagesSchema = Type.Array(Type.Array(CommentSchema))
