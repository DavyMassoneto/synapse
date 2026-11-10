import { type AnnotatedDiff } from "#evaluator/changes"
import { type Configuration } from "#evaluator/configuration"
import { askReviewer } from "./ask-reviewer"
import { publishIfCurrent } from "./publish-if-current"
import { reportVerdict } from "./report-verdict"

export async function evaluate(configuration: Configuration, diff: AnnotatedDiff): Promise<void> {
  const result = await askReviewer(configuration, diff)
  reportVerdict(result)
  await publishIfCurrent(configuration, diff, result)
}
