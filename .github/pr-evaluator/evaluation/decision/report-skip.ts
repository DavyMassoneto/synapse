import { type SkipEvaluation } from "./types"

export function reportSkip(decision: SkipEvaluation): void {
  console.log(decision.message)
}
