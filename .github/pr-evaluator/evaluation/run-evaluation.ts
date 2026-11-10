import { type Configuration } from "#evaluator/configuration"
import { annotateDiff } from "#evaluator/diff-annotation"
import { readDiff } from "#evaluator/diff-reading"
import { decideEvaluation } from "./decision"
import { evaluate } from "./evaluate"

export async function runEvaluation(configuration: Configuration): Promise<void> {
  const diff = annotateDiff(readDiff(configuration.github.baseSha, configuration.github.headSha))
  const decision = await decideEvaluation(configuration.github, diff)
  if (decision.kind === "proceed") {
    await evaluate(configuration, diff)
  } else {
    console.log(decision.message)
  }
}
