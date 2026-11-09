import Type from "typebox"
import { GENERAL_FINDING_LINE } from "./constants"

export const FindingSchema = Type.Object({
  rule: Type.String(),
  path: Type.String(),
  line: Type.Integer({ minimum: GENERAL_FINDING_LINE }),
  body: Type.String({ minLength: 1 }),
})

export const ReplySchema = Type.Object({
  coverage: Type.Array(Type.String()),
  findings: Type.Array(FindingSchema),
})
