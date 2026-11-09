import { Type } from "typebox"

export const FindingSchema = Type.Object({
  criterion: Type.Union([
    Type.Literal("clean-code"),
    Type.Literal("dry"),
    Type.Literal("yagni"),
    Type.Literal("srp"),
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

export const ReplySchema = Type.Object({
  verdict: Type.Union([Type.Literal("approve"), Type.Literal("approve_with_remarks"), Type.Literal("request_changes")]),
  summary: Type.String(),
  findings: Type.Array(FindingSchema),
})

export const StreamChunkSchema = Type.Object({
  error: Type.Optional(Type.Object({ message: Type.Optional(Type.String()) })),
  choices: Type.Optional(
    Type.Array(
      Type.Object({
        delta: Type.Object({ content: Type.Optional(Type.Union([Type.String(), Type.Null()])) }),
        finish_reason: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      }),
    ),
  ),
})

export const DATA_PREFIX = "data:"

export const DONE_PAYLOAD = "[DONE]"

export const LENGTH_FINISH = "length"

export const JSON_START = "{"

export const JSON_END = "}"

export const MAX_OUTPUT_TOKENS = 32_000

export const MODEL_TIMEOUT_MS = 2_400_000

export const MODEL_ATTEMPTS = 2

export const RETRY_DELAY_MS = 20_000

export const SERVER_ERROR_STATUS = 500

export const ERROR_BODY_CHARACTERS = 500
