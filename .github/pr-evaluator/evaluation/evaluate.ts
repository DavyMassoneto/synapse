import { type Configuration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { askReviewer } from "./ask-reviewer"
import { publishIfCurrent } from "./publication"
import { reportVerdict } from "./report-verdict"

export async function evaluate(configuration: Configuration, diff: AnnotatedDiff): Promise<void> {
  const result = await askReviewer(configuration, diff)
  reportVerdict(result)
  await publishIfCurrent(configuration, diff, result)
}
