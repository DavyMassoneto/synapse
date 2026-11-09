import { type AnnotatedDiff } from "#evaluator/changes"
import { type Configuration } from "#evaluator/configuration"
import { currentHeadSha, reviewMarker, wasReviewedByBot } from "#evaluator/pull-request-review"
import { type ReviewResult } from "#evaluator/review-result"
import { MESSAGE_ALREADY_REVIEWED, MESSAGE_SUPERSEDED } from "./constants"
import { publishEvaluation } from "./publish-evaluation"

export async function publishIfCurrent(
  configuration: Configuration,
  diff: AnnotatedDiff,
  result: ReviewResult,
): Promise<void> {
  const { github } = configuration
  if ((await currentHeadSha(github)) !== github.headSha) {
    console.log(MESSAGE_SUPERSEDED)
  } else if (await wasReviewedByBot(github, reviewMarker(github.headSha))) {
    console.log(MESSAGE_ALREADY_REVIEWED)
  } else {
    await publishEvaluation(configuration, diff, result)
  }
}
