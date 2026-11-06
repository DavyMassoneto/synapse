import { type ThinkingLevel, thinkingSchema } from "@/modules/advisor/public/config";

export const THINKING_LEVELS: readonly ThinkingLevel[] = thinkingSchema.anyOf.map(getThinkingValue);

function getThinkingValue(schema: (typeof thinkingSchema.anyOf)[number]): ThinkingLevel {
  return schema.const;
}
