import { annotateDiff, readDiff } from "#evaluator/changes"
import { type Configuration } from "#evaluator/configuration"
import { reviewMarker, wasReviewedByBot } from "#evaluator/pull-request-review"
import { MESSAGE_ALREADY_REVIEWED, MESSAGE_EMPTY_DIFF, MESSAGE_NO_TEXT_LINES } from "./constants"
import { evaluate } from "./evaluate"

export async function runEvaluation(configuration: Configuration): Promise<void> {
  const { github } = configuration
  const text = readDiff(github.baseSha, github.headSha)
  const diff = annotateDiff(text)
  if (await wasReviewedByBot(github, reviewMarker(github.headSha))) {
    console.log(MESSAGE_ALREADY_REVIEWED)
  } else if (text.trim().length === 0) {
    console.log(MESSAGE_EMPTY_DIFF)
  } else if (diff.lines.size === 0) {
    console.log(MESSAGE_NO_TEXT_LINES)
  } else {
    await evaluate(configuration, diff)
  }
}
