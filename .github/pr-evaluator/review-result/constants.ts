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
  line: Type.Integer({ minimum: 1 }),
  side: Type.Union([Type.Literal("LEFT"), Type.Literal("RIGHT")]),
  startLine: Type.Optional(Type.Integer({ minimum: 1 })),
  rule: Type.String(),
  evidence: Type.String(),
  impact: Type.String(),
  fix: Type.String(),
})

export const ReviewResultSchema = Type.Object({
  verdict: Type.Union([Type.Literal("approve"), Type.Literal("approve_with_remarks"), Type.Literal("request_changes")]),
  summary: Type.String(),
  findings: Type.Array(FindingSchema),
})

export const FENCE_PATTERN = /^```[^\n]*\n([\s\S]*)```$/

export const ISSUE_BREAK = "; "
