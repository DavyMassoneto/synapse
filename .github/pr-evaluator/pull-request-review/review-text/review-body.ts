import { type Finding, type ReviewResult } from "#evaluator/review-result"
import { SECTION_BREAK } from "../comment-text"
import { VERDICT_LABELS } from "./constants"
import { reviewMarker } from "./review-marker"
import { unplacedSection } from "./unplaced-section"

export function reviewBody(result: ReviewResult, unplaced: Finding[], inlineCount: number, headSha: string): string {
  return [
    reviewMarker(headSha),
    `## Avaliação automática: ${VERDICT_LABELS[result.verdict]}`,
    result.summary,
    `${inlineCount} comentário(s) nas linhas do diff e ${unplaced.length} apontamento(s) sem linha no diff.`,
    ...unplacedSection(unplaced),
  ].join(SECTION_BREAK)
}
