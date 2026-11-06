import { Type } from "typebox";
import { thinkingSchema } from "@/modules/advisor/public/config";

export const configSchema = Type.Object({
  model: Type.Optional(Type.String()),
  thinking: Type.Optional(thinkingSchema),
});
