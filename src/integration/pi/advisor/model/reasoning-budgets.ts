import type { ReasoningBudget } from "./reasoning-types";

export const REASONING_BUDGETS: ReasoningBudget[] = [
  { level: "minimal", tokens: 1_024 },
  { level: "low", tokens: 2_048 },
  { level: "medium", tokens: 8_192 },
  { level: "high", tokens: 16_384 },
  { level: "xhigh", tokens: 16_384 },
  { level: "max", tokens: 16_384 },
];
