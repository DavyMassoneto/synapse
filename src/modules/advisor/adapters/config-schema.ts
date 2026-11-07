import { Type } from "typebox";
import { THINKING_LEVELS } from "#synapse/modules/advisor/public";

export const thinkingSchema = Type.Enum(THINKING_LEVELS);

export const configSchema = Type.Object({
  model: Type.Optional(Type.String()),
  thinking: Type.Optional(thinkingSchema),
});
