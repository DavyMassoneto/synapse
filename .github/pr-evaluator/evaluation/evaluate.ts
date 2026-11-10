import { type Configuration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { askReviewer } from "./ask-reviewer"
import { publishIfCurrent } from "./publication"

export async function evaluate(configuration: Configuration, diff: AnnotatedDiff): Promise<void> {
  const result = await askReviewer(configuration, diff)
  console.log(`Veredito: ${result.verdict}; ${result.findings.length} apontamento(s)`)
  await publishIfCurrent(configuration.github, diff, result)
}
