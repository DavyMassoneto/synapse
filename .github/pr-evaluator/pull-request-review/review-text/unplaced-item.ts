import { type Finding } from "#evaluator/review-result"
import { CRITERION_LABELS, KIND_LABELS } from "../comment-text"

export function unplacedItem(finding: Finding): string {
  const label = CRITERION_LABELS[finding.criterion]
  return `- \`${finding.path}:${finding.line}\` (${label} · ${KIND_LABELS[finding.kind]}, ${finding.rule}): ${finding.evidence} Correção: ${finding.fix}`
}
