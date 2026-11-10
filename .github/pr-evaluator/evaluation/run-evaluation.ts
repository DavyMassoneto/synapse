import { type Configuration } from "#evaluator/configuration"
import { annotateDiff } from "#evaluator/diff-annotation"
import { readDiff } from "#evaluator/diff-reading"
import { applyDecision, decideEvaluation } from "./decision"
import { evaluate } from "./evaluate"

export async function runEvaluation(configuration: Configuration): Promise<void> {
  const rawDiff = readDiff(configuration.github.baseSha, configuration.github.headSha)
  const diff = annotateDiff(rawDiff)
  const decision = await decideEvaluation(configuration.github, rawDiff, diff)
  await applyDecision(decision, () => evaluate(configuration, diff))
}
