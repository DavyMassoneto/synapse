import { type THINKING_LEVELS } from "./levels.ts";

export type ThinkingLevel = (typeof THINKING_LEVELS)[keyof typeof THINKING_LEVELS];
