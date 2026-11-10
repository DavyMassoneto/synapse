import { type Configuration, type GithubConfiguration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { askReviewer } from "./ask-reviewer"
import { MESSAGE_NO_TEXT_LINES } from "./constants"
import { decideReviewState, type EvaluationDecision } from "./decision"
import { publishIfCurrent } from "./publication"

async function decideEvaluation(github: GithubConfiguration, diff: AnnotatedDiff): Promise<EvaluationDecision> {
  if (diff.lines.size === 0) {
    return { kind: "skip", message: MESSAGE_NO_TEXT_LINES }
  }
  return decideReviewState(github)
}

export async function evaluate(configuration: Configuration, diff: AnnotatedDiff): Promise<string> {
  const decision = await decideEvaluation(configuration.github, diff)
  if (decision.kind === "skip") {
    return decision.message
  }
  const result = await askReviewer(configuration, diff)
  console.log(`Veredito: ${result.verdict}; ${result.findings.length} apontamento(s)`)
  return publishIfCurrent(configuration.github, diff, result)
}
