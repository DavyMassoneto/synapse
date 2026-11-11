import { type ReasoningLevel } from "./types"

export const TEST_USAGE = {
  input: 1,
  output: 2,
  cacheRead: 3,
  cacheWrite: 4,
  totalTokens: 10,
  cost: { input: 0.1, output: 0.2, cacheRead: 0.3, cacheWrite: 0.4, total: 1 },
}

export const DEFAULT_WINDOW = 40_000

export const REASONING_LEVELS: ReasoningLevel[] = ["minimal", "low", "medium", "high", "xhigh", "max"]

export const IDLE_SIGNAL = new AbortController().signal
