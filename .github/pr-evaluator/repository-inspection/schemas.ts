import { Type } from "typebox"

export const InspectionSchema = Type.Object(
  {
    action: Type.Union([Type.Literal("files"), Type.Literal("read"), Type.Literal("search"), Type.Literal("history")]),
    path: Type.String(),
    text: Type.String(),
    startLine: Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
    endLine: Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
  },
  { additionalProperties: false },
)
