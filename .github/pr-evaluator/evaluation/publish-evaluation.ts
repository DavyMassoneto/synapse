import { type AnnotatedDiff } from "#evaluator/changes"
import { type Configuration } from "#evaluator/configuration"
import { placeFindings, publishReview, reviewBody } from "#evaluator/pull-request-review"
import { type ReviewResult } from "#evaluator/review-result"

export async function publishEvaluation(
  configuration: Configuration,
  diff: AnnotatedDiff,
  result: ReviewResult,
): Promise<void> {
  const { github } = configuration
  const placement = placeFindings(diff.lines, result.findings)
  const published = await publishReview(github, {
    commit_id: github.headSha,
    event: "COMMENT",
    body: reviewBody(result, placement.unplaced, placement.comments.length, github.headSha),
    comments: placement.comments,
  })
  console.log(`Review ${published.html_url}: ${placement.comments.length} comentário(s) em linhas do diff`)
  console.log(`Apontamentos sem linha no diff: ${placement.unplaced.length}`)
}
