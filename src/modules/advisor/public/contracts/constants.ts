import { Type } from "typebox"

export const thinkingLevelSchema = Type.Union([
  Type.Literal("off"),
  Type.Literal("minimal"),
  Type.Literal("low"),
  Type.Literal("medium"),
  Type.Literal("high"),
  Type.Literal("xhigh"),
  Type.Literal("max"),
])

export const THINKING_LEVELS = thinkingLevelSchema.anyOf.map((level) => level.const)

export const REFERENCE_SEPARATOR = "/"
