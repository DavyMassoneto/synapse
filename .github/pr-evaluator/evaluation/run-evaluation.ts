import { type Configuration } from "#evaluator/configuration"
import { annotateDiff } from "#evaluator/diff-annotation"
import { readDiff } from "#evaluator/diff-reading"
import { evaluate } from "./evaluate"

export async function runEvaluation(configuration: Configuration): Promise<void> {
  const diff = annotateDiff(readDiff(configuration.github.baseSha, configuration.github.headSha))
  console.log(await evaluate(configuration, diff))
}
