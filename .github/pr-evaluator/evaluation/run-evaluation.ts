import { annotateDiff, readDiff } from "#evaluator/changes"
import { type Configuration } from "#evaluator/configuration"
import { applyDecision } from "./apply-decision"
import { decideEvaluation } from "./decide-evaluation"
import { evaluate } from "./evaluate"

export async function runEvaluation(configuration: Configuration): Promise<void> {
  const text = readDiff(configuration.github.baseSha, configuration.github.headSha)
  const diff = annotateDiff(text)
  const decision = await decideEvaluation(configuration.github, text, diff)
  await applyDecision(decision, () => evaluate(configuration, diff))
}
