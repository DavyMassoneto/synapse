import { type Finding, type ReviewResult } from "#evaluator/review-result"
import { ITEM_BREAK, SECTION_BREAK, UNPLACED_TITLE, VERDICT_LABELS } from "./constants"
import { findingLabel } from "./finding-label"
import { reviewMarker } from "./review-marker"

function unplacedItem(finding: Finding): string {
  const location = `\`${finding.path}:${finding.line}\``
  return `- ${location} (${findingLabel(finding)}, ${finding.rule}): ${finding.evidence} Correção: ${finding.fix}`
}

function unplacedSection(unplaced: Finding[]): string[] {
  if (unplaced.length === 0) {
    return []
  }
  return [UNPLACED_TITLE, unplaced.map(unplacedItem).join(ITEM_BREAK)]
}

export function reviewBody(result: ReviewResult, unplaced: Finding[], inlineCount: number, headSha: string): string {
  return [
    reviewMarker(headSha),
    `## Avaliação automática: ${VERDICT_LABELS[result.verdict]}`,
    result.summary,
    `${inlineCount} comentário(s) nas linhas do diff e ${unplaced.length} apontamento(s) sem linha no diff.`,
    ...unplacedSection(unplaced),
  ].join(SECTION_BREAK)
}
