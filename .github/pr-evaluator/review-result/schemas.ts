import { Type } from "typebox"

export const FindingSchema = Type.Object({
  criterion: Type.Union([
    Type.Literal("clean-code"),
    Type.Literal("dry"),
    Type.Literal("yagni"),
    Type.Literal("srp"),
    Type.Literal("performance"),
    Type.Literal("architecture"),
  ]),
  kind: Type.Union([Type.Literal("violation"), Type.Literal("insufficient_context")]),
  path: Type.String({ minLength: 1 }),
  line: Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
  side: Type.Union([Type.Literal("LEFT"), Type.Literal("RIGHT")]),
  startLine: Type.Optional(Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER })),
  rule: Type.String(),
  evidence: Type.String(),
  impact: Type.String(),
  fix: Type.String(),
})

export const ReviewSubmissionSchema = Type.Object({
  summary: Type.String(),
  findings: Type.Array(FindingSchema),
})
