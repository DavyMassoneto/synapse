import { type EvaluationDecision, type Proceed } from "./types"

export async function applyDecision(decision: EvaluationDecision, proceed: Proceed): Promise<void> {
  if (decision.kind === "skip") {
    console.log(decision.message)
  } else {
    await proceed()
  }
}
