import { type EvaluationDecision, type Proceed, type SkipEvaluation } from "./types"

function reportSkip(decision: SkipEvaluation): void {
  console.log(decision.message)
}

export async function applyDecision(decision: EvaluationDecision, proceed: Proceed): Promise<void> {
  if (decision.kind === "skip") {
    reportSkip(decision)
  } else {
    await proceed()
  }
}
