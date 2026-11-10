import { reportSkip } from "./report-skip"
import { type EvaluationDecision, type Proceed } from "./types"

export async function applyDecision(decision: EvaluationDecision, proceed: Proceed): Promise<void> {
  if (decision.kind === "skip") {
    reportSkip(decision)
  } else {
    await proceed()
  }
}
