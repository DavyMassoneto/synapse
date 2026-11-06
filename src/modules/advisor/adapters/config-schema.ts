import { Type } from "typebox";
import { THINKING_LEVELS } from "@/modules";

export const configSchema = Type.Object({
  model: Type.Optional(Type.String()),
  thinking: Type.Optional(Type.Enum(THINKING_LEVELS)),
});
