import Type from "typebox"

export const StreamChunkSchema = Type.Object({
  choices: Type.Array(
    Type.Object({
      delta: Type.Object({ content: Type.Optional(Type.Union([Type.String(), Type.Null()])) }),
      finish_reason: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    }),
  ),
})
