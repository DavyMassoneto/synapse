import { Type } from "typebox";
import { THINKING_LEVELS } from "../public/contracts";
import { thinkingLiteral } from "./thinking-schema";

export const thinkingSchema = Type.Union(THINKING_LEVELS.map(thinkingLiteral));

export const configSchema = Type.Object({
  model: Type.Optional(Type.String()),
  thinking: Type.Optional(thinkingSchema),
});
