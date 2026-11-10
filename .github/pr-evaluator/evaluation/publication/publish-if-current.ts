import { type GithubConfiguration } from "#evaluator/configuration"
import { type AnnotatedDiff } from "#evaluator/diff-annotation"
import { publishReview } from "#evaluator/pull-request-review"
import { type ReviewResult } from "#evaluator/review-result"
import { recheckBeforePublishing } from "../decision"
import { prepareReview } from "./prepare-review"

async function publishEvaluation(
  github: GithubConfiguration,
  diff: AnnotatedDiff,
  result: ReviewResult,
): Promise<void> {
  const prepared = prepareReview(github.headSha, diff, result)
  const published = await publishReview(github, prepared.body, prepared.comments)
  console.log(`Review ${published.html_url}: ${prepared.comments.length} comentário(s) em linhas do diff`)
  console.log(`Apontamentos sem linha no diff: ${prepared.unplacedCount}`)
}

export async function publishIfCurrent(
  github: GithubConfiguration,
  diff: AnnotatedDiff,
  result: ReviewResult,
): Promise<void> {
  const decision = await recheckBeforePublishing(github)
  if (decision.kind === "proceed") {
    await publishEvaluation(github, diff, result)
  } else {
    console.log(decision.message)
  }
}
