import { type Configuration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { askReviewer } from "./ask-reviewer"
import { decideEvaluation } from "./decision"
import { publishIfCurrent } from "./publication"

export async function evaluate(configuration: Configuration, diff: AnnotatedDiff): Promise<string> {
  const decision = await decideEvaluation(configuration.github, diff)
  if (decision.kind === "skip") {
    return decision.message
  }
  const result = await askReviewer(configuration, diff)
  console.log(`Veredito: ${result.verdict}; ${result.findings.length} apontamento(s)`)
  return publishIfCurrent(configuration.github, diff, result)
}
