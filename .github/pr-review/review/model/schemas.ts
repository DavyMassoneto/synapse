import Type from "typebox"

export const FindingSchema = Type.Object({
  rule: Type.String(),
  path: Type.String(),
  line: Type.Integer({ minimum: 0 }),
  body: Type.String({ minLength: 1 }),
})

export const VerdictsSchema = Type.Object({ refuted: Type.Array(Type.Integer({ minimum: 1 })) })

export const ReplySchema = Type.Object({
  coverage: Type.Array(Type.String()),
  findings: Type.Array(FindingSchema),
})
