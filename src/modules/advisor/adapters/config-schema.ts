import { Type } from "typebox";

export const configSchema = Type.Object({
  model: Type.Optional(Type.String()),
  thinking: Type.Optional(
    Type.Union([
      Type.Literal("off"),
      Type.Literal("minimal"),
      Type.Literal("low"),
      Type.Literal("medium"),
      Type.Literal("high"),
      Type.Literal("xhigh"),
      Type.Literal("max"),
    ]),
  ),
});
