import { type THINKING_LEVELS } from "@/modules/advisor/public/config";

export type ThinkingLevel = (typeof THINKING_LEVELS)[keyof typeof THINKING_LEVELS];
