import { Type } from "typebox"

export const PageSchema = Type.Object(
  {
    startLine: Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
    endLine: Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
  },
  { additionalProperties: false },
)
