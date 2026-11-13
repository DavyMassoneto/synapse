import { Type } from "typebox"
import { PageSchema } from "#evaluator/output-page"

export const InspectionSchema = Type.Object(
  {
    action: Type.Union([Type.Literal("files"), Type.Literal("read"), Type.Literal("search"), Type.Literal("history")]),
    path: Type.String(),
    text: Type.String(),
    ...PageSchema.properties,
  },
  { additionalProperties: false },
)
